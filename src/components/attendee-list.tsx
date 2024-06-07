import { Search, MoreHorizontal, ChevronLeft, ChevronsLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { IconButton } from './icon-button'
import { Table } from './table'
import { TableHeader } from './table-header'
import { TableCell } from './table-cell'
import { TableRow } from './table-row'
import { ChangeEvent, useEffect, useState } from 'react'
import dayjs from 'dayjs';
import "dayjs/locale/pt-br";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime)
dayjs.locale("pt-br")

interface Attendee {
    id: string
    name: string
    email: string
    createdAt: string
    checkedInAt: string | null
}

export function AttendeeList() {
    const [search, setSearch] = useState(() => {
        const url = new URL(window.location.toString());
        return url.searchParams.get("search") ?? "";
    });

    const [page, setPage] = useState(() => {
        const url = new URL(window.location.toString());
        return Number(url.searchParams.get("page") ?? 1);
    });

    const [total, setTotal] = useState(0);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [error, setError] = useState<string | null>(null);

    const totalPages = Math.ceil(total / 10);

    useEffect(() => {
        const url = new URL(
            'https://nlwunit2024-production.up.railway.app/events/attendees/264d0ff8-325b-439d-93a8-e433594e4606'
        );

        url.searchParams.set('pageIndex', String(page - 1));

        if (search.length > 1) {
            url.searchParams.set("query", search);
        }

        fetch(url.toString())
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                setAttendees(data.attendees);
                setTotal(data.total);
                setError(null);
            })
            .catch((error) => {
                console.error('There was a problem with the fetch operation:', error);
                setError('Failed to fetch attendees. Please try again later.');
            });
    }, [page, search]);

    function setCurrentSearch(search: string) {
        const url = new URL(window.location.toString());
        url.searchParams.set("search", search);
        window.history.pushState({}, "", url);
        setSearch(search);
    };

    function setCurrentPage(page: number) {
        const url = new URL(window.location.toString());
        url.searchParams.set("page", String(page));
        window.history.pushState({}, "", url);
        setPage(page);
    };

    function onSearchInputChanged(event: ChangeEvent<HTMLInputElement>) {
        setCurrentSearch(event.target.value);
        setCurrentPage(1);
    }

    function goToFirstPage() {
        setCurrentPage(1);
    }
    function goToNextPage() {
        setCurrentPage(page + 1);
    }
    function goToPreviusPage() {
        setCurrentPage(page - 1);
    }
    function goToLastPage() {
        setCurrentPage(totalPages);
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className="flex gap-3 items-center">
                <h1 className="text-2xl font-bold">Participantes</h1>
                <div className="px-3 w-72 py-1.5 border border-white/10 rounded-lg text-sm flex items-center gap-3">
                    <Search className='size-4 text-emerald-300'/>
                    <input name='texto'
                        className="bg-transparent focus:ring-0 flex-1 outline-none border-0 p-0 text-sm"
                        placeholder="Buscar participante..."
                        value={search}
                        onChange={onSearchInputChanged}                        
                    />
                </div>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <Table>
                <thead>
                    <tr className='border-b border-white/10'>
                        <TableHeader style={{ width: 48 }}>
                            <input type="checkbox" className='size-4 bg-black/20 rounded border border-white/10' />
                        </TableHeader>
                        <TableHeader>Código</TableHeader>
                        <TableHeader>Participante</TableHeader>
                        <TableHeader>Data de inscrição</TableHeader>
                        <TableHeader>Data do check-in</TableHeader>
                        <TableHeader style={{ width: 64 }}></TableHeader>
                    </tr>
                </thead>
                <tbody>
                    {attendees
                    .filter((attendee) => 
                        attendee.name.toLowerCase().includes(search.toLowerCase())
                    )
                    .slice((page - 1) * 10, page * 10)
                    .map((attendee) => {
                        return (
                            <TableRow key={attendee.id} className='border-b border-white/10 hover:bg-white/5'>
                                <TableCell>
                                    <input type="checkbox" className='size-4 bg-black/20 rounded border border-white/10' />
                                </TableCell>
                                <TableCell>{attendee.id}</TableCell>
                                <TableCell>
                                    <div className='flex flex-col gap-1'>
                                        <span className='font-semibold text-white'>{attendee.name}</span>
                                        <span>{attendee.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{dayjs().to(attendee.createdAt)}</TableCell>
                                <TableCell>
                                    {attendee.checkedInAt === null 
                                        ? <span className='text-zinc-400'>Não fez check-in</span>  
                                        : dayjs().to(attendee.checkedInAt)}
                                </TableCell>
                                <TableCell>
                                    <IconButton transparent>
                                        <MoreHorizontal className='size-4' />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <TableCell colSpan={3}>
                            Mostrando {attendees.length} de {total} itens
                        </TableCell>
                        <TableCell className='text-right' colSpan={3}>
                            <div className='inline-flex items-center gap-8'>
                                <span>Pagina {page} de {totalPages}</span>
                                <div className='flex gap-1.5'>
                                    <IconButton onClick={goToFirstPage} disabled={page === 1}>
                                        <ChevronsLeft className='size-4'/>
                                    </IconButton>
                                    <IconButton onClick={goToPreviusPage} disabled={page === 1}>
                                        <ChevronLeft className='size-4'/>
                                    </IconButton>
                                    <IconButton onClick={goToNextPage} disabled={page === totalPages}>
                                        <ChevronRight className='size-4'/>
                                    </IconButton>
                                    <IconButton onClick={goToLastPage} disabled={page === totalPages}>
                                        <ChevronsRight className='size-4'/>
                                    </IconButton>
                                </div>
                            </div>
                        </TableCell>
                    </tr>
                </tfoot>
            </Table>
        </div>
    )
}
