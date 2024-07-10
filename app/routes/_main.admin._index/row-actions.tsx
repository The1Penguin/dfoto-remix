import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useSubmit } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Check, LinkIcon, MoreHorizontal, Trash2 } from 'lucide-react';

interface Props {
	id: number;
	published: boolean;
}
export function RowActions({ id, published }: Props) {
	const submit = useSubmit();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='h-8 w-8 p-0'>
					<span className='sr-only'>Öppna meny</span>
					<MoreHorizontal className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuSeparator></DropdownMenuSeparator>
				<DropdownMenuItem
					onSelect={() =>
						submit({ intent: 'thumbnail', id }, { method: 'POST' })
					}
				>
					<Check className='mr-2 h-4 w-4'></Check>
					<span>{published ? 'Avpublicera' : 'Publicera'}</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() => {
						navigator.clipboard.writeText(
							new URL(`/album/${id}`, window.location.origin).toString(),
						);
					}}
				>
					<LinkIcon className='mr-2 h-4 w-4'></LinkIcon>
					<span>Kopiera länk</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					className='text-destructive'
					onSelect={() => {
						submit({ intent: 'delete', id }, { method: 'POST' });
					}}
				>
					<Trash2 className='mr-2 h-4 w-4'></Trash2>
					<span>Ta bort</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
