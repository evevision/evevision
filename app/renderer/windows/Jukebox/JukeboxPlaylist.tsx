import React from 'react';
import {Typography} from '../../ui/Layout';
import { useTable, useSortBy, Column } from 'react-table';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { faSortUp, faSortDown, faPlay } from '@fortawesome/free-solid-svg-icons'



interface JukeboxPlaylistProps {
    playList:  {
        name: string,
        tracks: {title: string, number: number, duration: string, soundCloudTrackId: number}[]
    }
    currentTrack: {title: string, number: number, duration: string, soundCloudTrackId: number} | null,
    onTrackClick?: (track: {title: string, number: number, duration: string, soundCloudTrackId: number}) => void
}
const JukeboxPlaylist: React.FC<JukeboxPlaylistProps> = (props) => {
    const columns: Column<{title: string, number: number, duration: string, soundCloudTrackId: number}>[] = React.useMemo(
        () => [
        {
            Header: 'Number',
            accessor: 'number',
        },
        {
            Header: 'Title',
            accessor: 'title',
        },
        {
            Header: 'Duration',
            accessor: 'duration',
        },
        ],
        []
    );
    const data = React.useMemo(() => props.playList.tracks, [props.playList]);
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useSortBy);

    return (
        <table className="eve-table" {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                    <th style={{width: "15px"}} />
                    {headerGroup.headers.map(column => (
                        <th align="left" {...column.getHeaderProps(column.getSortByToggleProps())}>
                            <Typography>
                                {column.render('Header')}
                                {column.isSorted ? <FontAwesomeIcon icon={column.isSortedDesc ? faSortDown : faSortUp} style={{marginLeft: "4px"}}/> : ''}
                            </Typography>
                        </th>
                    ))}
                    <th style={{width: "50px"}}  />
                </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                prepareRow(row)
                const isRowSelected = row.original.soundCloudTrackId === props.currentTrack?.soundCloudTrackId;
                return (
                    <tr {...row.getRowProps()} className={isRowSelected ? "selected" : ""} onClick={() => props.onTrackClick ? props.onTrackClick({...row.original}) : ""}>
                        <td>{isRowSelected && <FontAwesomeIcon size={"sm"} icon={faPlay} />}</td>
                        {row.cells.map(cell => {
                            return <td {...cell.getCellProps()}><Typography>{cell.render('Cell')}</Typography></td>
                        })}
                        <td />
                    </tr>
                )
                })}
            </tbody>
        </table>    
    )
}
export default React.memo(JukeboxPlaylist);