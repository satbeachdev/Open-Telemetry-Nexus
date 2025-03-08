import React, { useMemo, useEffect, useState, useRef } from 'react';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef, type MRT_Row, type MRT_TableOptions } from 'material-react-table';
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventService from '../services/eventService';
import TimeFormatter from '../TimeFormatter'
import { Box, Paper, Typography, useTheme, Table, TableBody, TableCell, TableRow, IconButton } from '@mui/material'
import { Allotment, AllotmentHandle } from "allotment"
import "allotment/dist/style.css"
import Timeline from './timeline'
import FilterEvents, { FilterEventsMethods } from './FilterEvents'
import CloseIcon from '@mui/icons-material/Close'
import { Event } from '../models/Event';
import { Attribute } from '../models/Attribute';
import { TraceEvent } from '../models/TraceEvent';

const ITEMS_PER_PAGE = 50; // Adjust as needed
const REFRESH_INTERVAL = 5000;

type EventQueryResult = {
	events: Event[]; // Assuming TraceEvent is the correct type from EventService
	nextPage: number;
};

interface EventRowState {
    expanded: boolean;
    attributes?: any[];
    loading: boolean;
}

interface EventListProps {
  onFilterEventsRefChange?: (ref: React.RefObject<FilterEventsMethods>) => void;
}

const InternalEventList: React.FC<EventListProps> = ({ onFilterEventsRefChange }) => {
	const [tableHeight, setTableHeight] = useState('100vh');
    const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([]); 
    const [eventAttributes, setEventAttributes] = useState<Map<number, Attribute[]>>(new Map());
    const [topPaneSize, setTopPaneSize] = useState<number>(0)
    const allotmentRef = useRef<AllotmentHandle>(null);
    const theme = useTheme();
    const [resultCount, setResultCount] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
    const [highlightedEventId, setHighlightedEventId] = useState<Number | null>(null);
    const [rowStates, setRowStates] = useState<Map<string, EventRowState>>(new Map());
    const timelineRef = useRef<HTMLDivElement>(null);
    const filterEventsRef = useRef<FilterEventsMethods>(null);

    const { data, fetchNextPage, isError, isFetching, isLoading, refetch } = useInfiniteQuery<EventQueryResult>({
		queryKey: ['events', searchTerm],
		queryFn: async ({ pageParam }) => {
			const skip = (pageParam as number) * ITEMS_PER_PAGE;

			const result = await EventService.FilterEvents(searchTerm, skip, ITEMS_PER_PAGE);

            setResultCount(result.count);

            if (highlightedEventId) {
                const highlightedEventExists = result.data.some(event => event.id === highlightedEventId);
                if (!highlightedEventExists) {
                    setHighlightedEventId(null);
                }
            }

			return { events: result.data, nextPage: (pageParam as number) + 1 };
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextPage,
		refetchOnWindowFocus: false,
	});

    useEffect(() => {
        if (!autoRefreshEnabled) return;

        const timer = setInterval(() => {
            if (!isFetching) {
                refetch();
            }
        }, REFRESH_INTERVAL);

        return () => clearInterval(timer);
    }, [autoRefreshEnabled, isFetching, refetch]); 

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
            size: undefined,
            minSize: 120,
            maxSize: 200,
            grow: 1,
            Cell:({ cell }) => (<span>{new Date(cell.getValue<Date>()).toISOString().replace('T', ' ').replace('Z', '')}</span>)
          },
          {
            accessorKey: 'serviceName',
            header: 'Service',
            size: undefined,
            minSize: 80,
            maxSize: 150,
            grow: 1,             
          },          
          {
            accessorKey: 'message',
            header: 'Message',
            size: undefined,
            grow: 4,             
          },
          {
            accessorKey: 'durationMilliseconds',
            header: 'Duration',
            size: undefined,
            minSize: 60,
            maxSize: 100,
            grow: 1,
            Cell: ({ cell }) => (
              <span style={{ display: 'block', textAlign: 'right' }}>
                {TimeFormatter.FormatTime(cell.getValue<number>(), '')}
              </span>
            )
          }],
		[]
	);

	const flatData = useMemo(() => 
		(data as InfiniteData<EventQueryResult>)?.pages.flatMap((page) => page.events) ?? [], 
		[data]
	);

    const handleRowClick = async (row: Event, tableRow: MRT_Row<Event>) => {
        if (row.traceId) {
            EventService.LoadTraceEvents(row.traceId)
                .then(events => {
                    setTraceEvents(events);
                })
                .catch(error => {
                    console.error('Error fetching trace events:', error);
                });
        }

        if (row.id && !eventAttributes.has(row.id)) {
            const attributes = await EventService.LoadEventAttributes(row.id);
            setEventAttributes(prev => new Map(prev).set(row.id, attributes));
        }

        tableRow.toggleExpanded();
    };
      
    const handleEventHover = (eventId: Number | null) => {
      setHighlightedEventId(eventId);
    };

    const handleEventExpand = (eventId: number) => {
        console.log('Event expand clicked:', eventId);
        
        // Debug: Log all row IDs
        const allRows = table.getRowModel().rows;
        console.log('Available row IDs:', allRows.map(row => row.id));
        
        // Try finding the row by matching the event ID
        const row = allRows.find(row => row.original.id === eventId);
        
        if (row) {
            console.log('Found row:', row);
            handleRowClick(row.original, row);
        } else {
            console.log('Row not found for event ID:', eventId);
        }
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
			sx: { 
                height: tableHeight, 
                maxHeight: 'unset',
                '& .MuiTableCell-root': {
                    fontSize: 'inherit'
                }
            },
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
        muiTableBodyRowProps: ({ row }) => {
            const isHighlighted = row.original?.id === highlightedEventId;
            const isExpanded = row.getIsExpanded();
            const expandedBgColor = theme.palette.action.selected;
            
            return {
                onClick: () => handleRowClick(row.original, row),
                sx: {
                    cursor: 'pointer',
                    backgroundColor: isHighlighted ? 
                        theme.palette.action.selected : 
                        isExpanded ?
                            expandedBgColor :
                            'inherit',
                    '& .MuiTableCell-root': {
                        backgroundColor: 'transparent',
                    },
                    // Style the detail panel container
                    '& td.MuiTableCell-root.MuiTableCell-body[colspan]': {
                        backgroundColor: 'transparent',
                        padding: 0,
                    },
                    // Ensure detail panel content matches exactly
                    '& .MuiCollapse-root': {
                        backgroundColor: 'transparent',
                    },
                },
            };
        },
        renderDetailPanel: ({ row }) => (
            <Box sx={{ 
                padding: 0,
                backgroundColor: 'transparent',
                width: '100%',
                pl: '30px',
            }}>
                <Table size="small" sx={{ 
                    '& td, & th': { 
                        border: 'none',
                        paddingTop: '1px',
                        paddingBottom: '1px',
                        lineHeight: '1.25',
                        backgroundColor: 'transparent',
                    },
                    margin: 0,
                    backgroundColor: 'transparent',
                    tableLayout: 'auto',
                }}>
                    <TableBody sx={{ backgroundColor: 'transparent' }}>
                        {eventAttributes.get(row.original.id)?.map((attr, index) => (
                            <TableRow key={index} sx={{ backgroundColor: 'transparent' }}>
                                <TableCell 
                                    component="th" 
                                    scope="row" 
                                    sx={{ 
                                        padding: '1px 8px 1px 0',
                                        verticalAlign: 'top',
                                        whiteSpace: 'nowrap',
                                        minWidth: '148px',
                                    }}
                                >
                                    {attr.name}
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        padding: '1px 8px 1px 0',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        width: '100%',
                                        ...(attr.name === 'exception.stacktrace' && {
                                            backgroundColor: '#a00000 !important',
                                            color: '#ffffff',
                                            padding: '8px 8px',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace'
                                        })
                                    }}
                                >
                                    {attr.value}
                                </TableCell>
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
        // Clear all attributes
        setEventAttributes(new Map());
        
        // Clear expanded states by resetting the table state
        table.resetExpanded();
        
        setSearchTerm(newSearchTerm);
        refetch();
    };

    const toggleRow = async (eventId: string) => {
        const currentState = rowStates.get(eventId) || { expanded: false, loading: false };
        const newStates = new Map(rowStates);
        
        if (!currentState.expanded) {
            if (!currentState.attributes) {
                newStates.set(eventId, { ...currentState, expanded: true, loading: true });
                setRowStates(newStates);
                
                const attributes = await EventService.LoadEventAttribute(eventId);
                newStates.set(eventId, { 
                    expanded: true, 
                    attributes: attributes,
                    loading: false 
                });
            } else {
                newStates.set(eventId, { ...currentState, expanded: true });
            }
        } else {
            newStates.set(eventId, { ...currentState, expanded: false });
        }
        
        setRowStates(newStates);
    };

    useEffect(() => {
        if (traceEvents.length > 0 && timelineRef.current) {
            const calculateSize = () => {
                if (timelineRef.current) {
                    const timelineHeight = timelineRef.current.scrollHeight;
                    // Increased padding from 56 to 76 to add more bottom margin
                    const totalHeight = timelineHeight + 76; // 24px header + 32px padding + 20px bottom margin
                    
                    if (Math.abs(totalHeight - topPaneSize) > 5) {
                        setTopPaneSize(totalHeight);
                    }
                }
            };

            setTimeout(calculateSize, 100);

            const resizeObserver = new ResizeObserver(() => {
                setTimeout(calculateSize, 50);
            });
            resizeObserver.observe(timelineRef.current);

            return () => {
                if (timelineRef.current) {
                    resizeObserver.unobserve(timelineRef.current);
                }
            };
        } else {
            setTopPaneSize(0);
        }
    }, [traceEvents, topPaneSize]);

    useEffect(() => {
        if (onFilterEventsRefChange) {
            onFilterEventsRefChange(filterEventsRef);
        }
    }, [onFilterEventsRefChange]);

    const getTraceTimeRange = (events: TraceEvent[]) => {
        if (!events.length) return null;
        
        const startTime = new Date(Math.min(...events.map(e => e.startTime.toInstant().toEpochMilli())));
        const endTime = new Date(Math.max(...events.map(e => e.startTime.toInstant().toEpochMilli() + (e.durationMilliseconds || 0))));
        
        return { startTime, endTime };
    };

    return (
        <Allotment ref={allotmentRef} vertical defaultSizes={[topPaneSize, -1]}>
            <Allotment.Pane minSize={0}>
                <Paper sx={{ 
                    p: '0',  // Reverted from p: 0
                    height: '100%', 
                    overflow: 'hidden',
                    backgroundColor: theme.palette.background.default,
                    display: topPaneSize > 0 ? 'block' : 'none',
                    position: 'relative'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1
                    }}>
                        <Typography variant="h6">
                            Trace Timeline
                            {traceEvents.length > 0 && (() => {
                                const range = getTraceTimeRange(traceEvents);
                                if (range) {
                                    return <span style={{ fontSize: 'calc(1.25rem - 2pt)' }}>
                                        {` (${range.startTime.toISOString().replace('T', ' ').replace('Z', '')} - ${range.endTime.toISOString().replace('T', ' ').replace('Z', '')})`}
                                    </span>;
                                }
                                return '';
                            })()}
                        </Typography>
                        <IconButton 
                            size="small"
                            onClick={() => {
                                setTopPaneSize(0);
                                setTraceEvents([]);
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <div 
                        ref={timelineRef} 
                        style={{ 
                            position: 'relative',
                            height: topPaneSize ? topPaneSize - 76 : 0,
                            marginBottom: '20px'  // Reverted padding
                        }}
                    >
                        <Timeline 
                            events={traceEvents} 
                            onEventHover={handleEventHover}
                            onEventClick={handleEventExpand}
                        />
                    </div>
                </Paper>
            </Allotment.Pane>
            <Allotment.Pane>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <FilterEvents 
                        ref={filterEventsRef}
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

const EventList: React.FC<EventListProps> = (props) => (
  <QueryClientProvider client={queryClient}>
    <InternalEventList {...props} />
  </QueryClientProvider>
);

export default EventList;
