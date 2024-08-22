import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getParams } from 'remix-params-helper';
import { z } from 'zod';
import { deleteAlbum, setPubishedStatus } from '~/lib/server/actions';
import { ensureRole } from '~/lib/server/auth';
import { getAllAlbums } from '~/lib/server/data';
import { AlbumTable } from './table';

export async function action({ request, context }: ActionFunctionArgs) {
	const formData = await request.formData();
	switch (formData.get('intent')) {
		case 'publish': {
			ensureRole(['publish:album'], context);
			const result = getParams(
				formData,
				z.object({
					id: z.number(),
					published: z.boolean(),
				}),
			);
			if (!result.success) {
				return result;
			}

			await setPubishedStatus(result.data.id, !result.data.published);

			return { success: true } as const;
		}
		case 'delete': {
			ensureRole(['delete:album'], context);
			const result = getParams(
				formData,
				z.object({
					id: z.number(),
				}),
			);
			if (!result.success) {
				return result;
			}

			await deleteAlbum(result.data.id);
			return { success: true } as const;
		}
		default:
			throw new Error(`Invalid intent: ${formData.get('intent')}`);
	}
}

export async function loader({ request, context }: LoaderFunctionArgs) {
	await ensureRole(['read:album'], context);
	const albums = await getAllAlbums();
	return { albums };
}

export default function Admin() {
	const { albums } = useLoaderData<typeof loader>();
	return (
		<div className='container mt-4 flex flex-col gap-4'>
			<h1 className='text-3xl font-extrabold tracking-tight'>Album</h1>
			<AlbumTable data={albums} />
		</div>
	);
}
