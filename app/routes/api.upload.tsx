import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
  type ActionFunctionArgs,
  NodeOnDiskFile,
} from '@remix-run/node';
import { z } from 'zod';
import sharp from 'sharp';
import type { InferInsertModel } from 'drizzle-orm';
import { image } from '~/lib/schema.server';
import exif from 'exif-reader';
import { db } from '~/lib/db.server';
import { ensureRole } from '~/lib/auth.server';
import { uploadsPath } from '~/lib/storage/paths';
import { commitUpload } from '~/lib/storage/image';
import { getParams } from 'remix-params-helper';

const imageTypes = ['image/jpeg', 'image/png'];

const schema = z.object({
  id: z.coerce.number(),
  files: z
    .array(z.instanceof(NodeOnDiskFile))
    .min(1, 'At least 1 file is required'),
});

export async function action({ request }: ActionFunctionArgs) {
  const { claims } = await ensureRole(['write:image'])(request);

  const uploadHandler = composeUploadHandlers(
    createFileUploadHandler({
      directory: uploadsPath,
      filter: ({ contentType }) => imageTypes.includes(contentType),
    }),
    createMemoryUploadHandler()
  );

  const formData = await parseMultipartFormData(request, uploadHandler);
  const result = getParams(formData, schema);

  if (!result.success) {
    return result;
  }

  const insertdata = await Promise.all(
    result.data.files.map(async (file, i) => {
      const metadata = await sharp(file.getFilePath()).metadata();
      const exif_data = metadata.exif ? exif(metadata.exif) : (null as any);
      const taken_at =
        exif_data?.Image?.DateTime ?? new Date(file.lastModified) ?? new Date();

      return {
        album_id: result.data.id,
        mimetype: file.type,
        taken_by: claims?.sub,
        taken_by_name: claims?.name ?? claims?.email ?? null,
        taken_at,
        created_by: claims?.sub,
        exif_data,
      } satisfies InferInsertModel<typeof image>;
    })
  );

  db.transaction(async (db) => {
    const inserted = await db.insert(image).values(insertdata).returning({
      id: image.id,
      mimetype: image.mimetype,
      album_id: image.album_id,
    });

    await Promise.all(
      inserted.map(async (image, i) => {
        commitUpload(result.data.files[i].getFilePath(), image);
      })
    );
  });

  return { success: true } as const;
}
