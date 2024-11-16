import React, { useMemo, useEffect, useState, useRef } from 'react';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef, type MRT_Row, type MRT_TableOptions } from 'material-react-table';
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventService, { Event, TraceEvent, Attribute } from '../eventService';
import TimeFormatter from '../TimeFormatter'
import { Box, Paper, Typography, useTheme, Table, TableBody, TableCell, TableRow } from '@mui/material'
import { Allotment, AllotmentHandle } from "allotment"
import "allotment/dist/style.css"
import Timeline from './timeline'
import FilterEvents from './FilterEvents'

const ITEMS_PER_PAGE = 50; // Adjust as needed
const REFRESH_INTERVAL = 5000;

type EventQueryResult = {
	events: Event[]; // Assuming TraceEvent is the correct type from EventService
	nextPage: number;
};

const InternalEventList: React.FC = () => {
	const [tableHeight, setTableHeight] = useState('100vh');
    const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([]); 
    const [eventAttributes, setEventAttributes] = useState<Attribute[]>([]);
    const [topPaneSize, setTopPaneSize] = useState<number>(0)
    const allotmentRef = useRef<AllotmentHandle>(null);
    const theme = useTheme();
    const [resultCount, setResultCount] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

	    // Add refresh effect
    useEffect(() => {
        if (!autoRefreshEnabled) return;

        const timer = setInterval(() => {
            refetch();
        }, REFRESH_INTERVAL);

        return () => clearInterval(timer);
    }, [autoRefreshEnabled]); 

    useEffect(() => {
		const updateHeight = () => {
			const windowHeight = window.innerHeight;
			setTableHeight(`${windowHeight}px`);
		};

		updateHeight();
		window.addEventListener('resize', updateHeight);
		return () => window.removeEventListener('resize', updateHeight);
	}, []);

    useEffect(() => {
        if (allotmentRef.current) {
            allotmentRef.current.resize([topPaneSize]);
        }
      }, [topPaneSize]);
      
    // Column Definitions
    const columns = useMemo<MRT_ColumnDef<Event>[]>(
		() => [
          {
            accessorKey: 'startTime',
            header: 'Timestamp',
            size: 148,
            maxSize: 148,
            grow: 0,
            Cell:({ cell }) => (<span>{new Date(cell.getValue<Date>()).toISOString().replace('T', ' ').replace('Z', '')}</span>)
          },
          {
            accessorKey: 'serviceName',
            header: 'Service',
            size: 100,
            maxSize: 100,
            grow: 0,             
          },          
          {
            accessorKey: 'message',
            header: 'Message',
            size: undefined, // Remove fixed size
            grow: 4,             
          },
          {
            accessorKey: 'durationMilliseconds',
            header: 'Duration',
            size: 80,
            maxSize: 80,
            grow: 0,
            Cell: ({ cell }) => (
              <span style={{ display: 'block', textAlign: 'right' }}>
                {TimeFormatter.FormatTime(cell.getValue<number>(), '')}
              </span>
            )
          }],
		[]
	);

	const { data, fetchNextPage, isError, isFetching, isLoading, refetch } = useInfiniteQuery<EventQueryResult>({
		queryKey: ['events', searchTerm],
		queryFn: async ({ pageParam }) => {
			const skip = (pageParam as number) * ITEMS_PER_PAGE;

			const result = await EventService.FilterEvents(searchTerm, skip, ITEMS_PER_PAGE);

            setResultCount(result.count);

			return { events: result.data, nextPage: (pageParam as number) + 1 };
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextPage,
		refetchOnWindowFocus: false,
	});

	const flatData = useMemo(() => 
		(data as InfiniteData<EventQueryResult>)?.pages.flatMap((page) => page.events) ?? [], 
		[data]
	);

    const handleRowClick = (row: Event, tableRow: MRT_Row<Event>) => {
        if (row.traceId) {
          EventService.LoadTraceEvents(row.traceId)
            .then(events => {
                setTraceEvents(events);
                setTopPaneSize(240);
            })
            .catch(error => {
              console.error('Error fetching trace events:', error);
            });
        }

        if (row.id) {
          EventService.LoadEventAttributes(row.id)
            .then(attributes => {
                setEventAttributes(attributes);
            })
            .catch(error => {
              console.error('Error fetching trace events:', error);
            });
        }

        tableRow.toggleExpanded();
      };
      
    const tableOptions: MRT_TableOptions<Event> = {
		columns,
		data: flatData,
        enableColumnActions: false,
        enableColumnFilters: false,
        enablePagination: false,
        enableSorting: false,
        enableTopToolbar: false,
        enableRowVirtualization: true,
        enableColumnResizing: true,
        layoutMode: 'grid',
		manualPagination: true,
		rowCount: resultCount,
        manualFiltering: true,
        manualSorting: true,        
		onPaginationChange: () => {}, // Required for manual pagination
		state: { isLoading, showProgressBars: isFetching },
		muiTableContainerProps: {
			sx: { height: tableHeight, maxHeight: 'unset' },
		},
		muiToolbarAlertBannerProps: isError
			? { color: 'error', children: 'Error loading data' }
			: undefined,
		muiTableProps: {
			onScroll: (event) => {
				const { scrollHeight, scrollTop, clientHeight } = event.target as HTMLDivElement;
				if (scrollHeight - scrollTop - clientHeight < 200) {
					fetchNextPage();
				}
			},
			sx: {
				tableLayout: 'fixed',
				// '& .MuiTableCell-root': {
				// 	borderRight: '1px solid rgba(224, 224, 224, 1)',
				// },
				// '& .MuiTableCell-root:last-child': {
				// 	borderRight: 'none',
				// },
				'& .MuiTableHead-root .MuiTableCell-root': {
					backgroundColor: theme.palette.action.hover,  // Use theme color for shading
					fontWeight: 'bold',  // Optional: make header text bold
				},
			},
		},
        muiTableBodyRowProps: ({ row }) => ({
            onClick: () => handleRowClick(row.original, row),
            sx: { cursor: 'pointer' },
          }),
        renderDetailPanel: ({ row }) => (
            <Box sx={{ padding: '1rem' }}>
                <Table size="small" sx={{ '& td, & th': { border: 'none' } }}>
                    <TableBody>
                        {eventAttributes.map((attr, index) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row" sx={{ padding: '4px 16px 4px 0' }}>{attr.name}</TableCell>
                                <TableCell sx={{ padding: '4px 0' }}>{attr.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        ),
        enableExpanding: true,
        muiTableHeadCellProps: {
            sx: {
                '& .Mui-TableHeadCell-Content-Labels': {
                    '& .MuiButtonBase-root': {
                        display: 'none', // This hides the expand all button in the header
                    },
                },
            },
        },
        displayColumnDefOptions: {
            'mrt-row-expand': {
                size: 0,
                minSize: 0,
                maxSize: 0,
            },
        },
    };

    const table = useMaterialReactTable(tableOptions);
    
    const handleSearch = (newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
        refetch();
    };

    return (
        <Allotment ref={allotmentRef} vertical defaultSizes={[topPaneSize, -1]}>
            <Allotment.Pane minSize={0}>
                <Paper sx={{ 
                    p: 2, 
                    height: '100%', 
                    overflow: 'auto',
                    backgroundColor: theme.palette.background.default,
                    display: topPaneSize > 0 ? 'block' : 'none'                    
                }}>
                    <div style={{ height: topPaneSize, overflow: 'auto' }}>
                        <Typography variant="h6">Trace Timeline</Typography>
                        <Timeline events={traceEvents} />
                    </div>
                </Paper>
            </Allotment.Pane>
            <Allotment.Pane>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <FilterEvents 
                        resultCount={resultCount} 
                        onSearch={handleSearch}
                        autoRefreshEnabled={autoRefreshEnabled}
                        onAutoRefreshChange={setAutoRefreshEnabled}
                    />
                    <div style={{ height: tableHeight, overflow: 'hidden', marginTop: '8px' }}>
                        <MaterialReactTable table={table} />
                    </div>
                </Box>
            </Allotment.Pane>
        </Allotment>
    );
};

const queryClient = new QueryClient();

const EventList = () => (
    //App.tsx or AppProviders file. Don't just wrap this component with QueryClientProvider! Wrap your whole App!
    <QueryClientProvider client={queryClient}>
      <InternalEventList />
    </QueryClientProvider>
  );

export default EventList;
