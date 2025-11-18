import React, { useState, useMemo, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { IsometricGrid, Stamp } from './components/IsometricGrid'
import { GridCell } from './components/types'
import './App.css'
import { Book, findBookById } from './data/books'
import BookPopup from './components/BookPopup'
import books from './data/books.json';
import AboutPage from './components/AboutPage';
import Downloads from './components/Downloads';
import HoverNameDisplay from './components/HoverNameDisplay';
import HoverConnector from './components/HoverConnector';

// Create a map of stamp IDs to book titles
const bookTitleMap: Record<number, string> = {};
books.forEach(book => {
  bookTitleMap[book.id] = book.title;
});
// Data from the original HTML prototype
const rowStartingColOffsets = [0, 0, 0, 0, 0, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15, 15, 15, 15, 15]
const initialGridCellsData: GridCell[][] = [
  [
    {stamp: {id: 1, name: bookTitleMap[1]}}, 
    {stamp: null}, 
    {stamp: {id: 2, name: bookTitleMap[2]}}, 
    {stamp: null}, 
    {stamp: {id: 3, name: bookTitleMap[3]}}
  ],
  [
    {stamp: null}, 
    {stamp: {id: 4, name: bookTitleMap[4]}}, 
    {stamp: null}, 
    {stamp: {id: 5, name: bookTitleMap[5]}}, 
    {stamp: null}
  ],
  [
    {stamp: {id: 6, name: bookTitleMap[6]}}, 
    {stamp: null}, 
    {stamp: {id: 7, name: bookTitleMap[7]}}, 
    {stamp: null}, 
    {stamp: {id: 8, name: bookTitleMap[8]}}
  ],
  [
    {stamp: null}, 
    {stamp: {id: 9, name: bookTitleMap[9]}}, 
    {stamp: null}, 
    {stamp: {id: 10, name: bookTitleMap[10]}}, 
    {stamp: null}
  ],
  [
    {stamp: {id: 11, name: bookTitleMap[11]}}, 
    {stamp: null}, 
    {stamp: {id: 12, name: bookTitleMap[12]}}, 
    {stamp: null}, 
    {stamp: {id: 13, name: bookTitleMap[13]}}
  ],
  [
    {stamp: {id: 14, name: bookTitleMap[14]}}, 
    {stamp: null}, 
    {stamp: {id: 15, name: bookTitleMap[15]}}, 
    {stamp: null}, 
    {stamp: {id: 16, name: bookTitleMap[16]}}
  ],
  [
    {stamp: null}, 
    {stamp: null}, 
    {stamp: {id: 17, name: bookTitleMap[17]}}, 
    {stamp: null}, 
    {stamp: {id: 18, name: bookTitleMap[18]}}
  ],
  [
    {stamp: {id: 19, name: bookTitleMap[19]}}, 
    {stamp: null}, 
    {stamp: {id: 20, name: bookTitleMap[20]}}, 
    {stamp: null}, 
    {stamp: {id: 21, name: bookTitleMap[21]}}
  ],
  [
    {stamp: null}, 
    {stamp: null}, 
    {stamp: {id: 22, name: bookTitleMap[22]}}, 
    {stamp: null}, 
    {stamp: {id: 23, name: bookTitleMap[23]}}
  ],
  [
    {stamp: {id: 24, name: bookTitleMap[24]}}, 
    {stamp: null}, 
    {stamp: {id: 25, name: bookTitleMap[25]}}, 
    {stamp: null}, 
    {stamp: {id: 26, name: bookTitleMap[26]}}
  ],
  [   {stamp: {id: 27, name: bookTitleMap[27]}}, 
    {stamp: null}, 
    {stamp: {id: 28, name: bookTitleMap[28]}}, 
    {stamp: null}, 
    {stamp: {id: 29, name: bookTitleMap[29]}},
    {stamp: null}],
  [   {stamp: null}, 
    {stamp: {id: 30, name: bookTitleMap[30]}}, 
    {stamp: null}, 
    {stamp: {id: 31, name: bookTitleMap[31]}}, 
    {stamp: null}, 
    {stamp: {id: 32, name: bookTitleMap[32]}}],
  [   {stamp: null}, 
    {stamp: {id: 33, name: bookTitleMap[33]}}, 
    {stamp: null}, 
    {stamp: {id: 34, name: bookTitleMap[34]}}, 
    {stamp: null}],
  [  {stamp: null}, 
    {stamp: {id: 35, name: bookTitleMap[35]}}, 
    {stamp: null}, 
    {stamp: {id: 36, name: bookTitleMap[36]}}, 
    {stamp: {id: 37, name: bookTitleMap[37]}}],
  [
    {stamp: null}, 
    {stamp: {id: 38, name: bookTitleMap[38]}}, 
    {stamp: null}
  ],
  [
    {stamp: {id: 39, name: bookTitleMap[39]}}, 
      {stamp: null}, 
      {stamp: {id: 40, name: bookTitleMap[40]}}, 
      {stamp: null}, 
      {stamp: null}],
  [{stamp: null}, {stamp: null}, {stamp: null}, {stamp: null}, {stamp: null}],
  [{stamp: null}, {stamp: null}, {stamp: null}, {stamp: null}, {stamp: null}],
  [{stamp: null}, {stamp: null}, {stamp: null}, {stamp: null}, {stamp: null}],
  [{stamp: null}, {stamp: null}, {stamp: null}, {stamp: null}, {stamp: null}]
]

function getAllStamps(grid: GridCell[][]): Stamp[] {
  const seen = new Set<number>()
  const stamps: Stamp[] = []
  grid.forEach(row => row.forEach(cell => {
    if (cell.stamp && !seen.has(cell.stamp.id)) {
      stamps.push(cell.stamp)
      seen.add(cell.stamp.id)
    }
  }))
  return stamps
}

const App: React.FC = () => {
  console.log("App component rendered"); // Earliest possible log in the component function body
  const [search, setSearch] = useState('')
  const [hoveredStampId, setHoveredStampId] = useState<number | null>(null)
  const [hoveredDetail, setHoveredDetail] = useState<{ id: number; el: HTMLElement } | null>(null)
  const [key, setKey] = useState(0); // Add a key state
  const [gridVisibleHeight, setGridVisibleHeight] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const labelBoxRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  useEffect(() => {
    const onResize = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Filter stamps for sidebar
  const allStamps = useMemo(() => getAllStamps(initialGridCellsData), [])
  console.log("App.tsx: All stamps count:", allStamps.length);

  const sidebarFilteredStamps = useMemo(() => {
    console.log("App.tsx: Recalculating sidebarFilteredStamps. Search:", search);
    const result = search
      ? allStamps.filter(stamp => stamp.name.toLowerCase().includes(search.toLowerCase()))
      : allStamps;
    console.log("App.tsx: Sidebar filteredStamps count:", result.length);
    return result;
  }, [search, allStamps])

  const gridCellsData = useMemo(() => initialGridCellsData, []);

  const displayedGridCellsData = useMemo(() => {
    if (!search) return initialGridCellsData;

    const stampsToPlace = sidebarFilteredStamps; 
    if (stampsToPlace.length === 0) return [];

    const newGrid: GridCell[][] = [];
    let stampIndex = 0;

    for (let r = 0; r < initialGridCellsData.length; r++) {
      const originalRow = initialGridCellsData[r];
      const newRow: GridCell[] = [];
      let rowHasStamps = false;

      for (let c = 0; c < originalRow.length; c++) {
        // Only place stamps in original stamp slots (where original was not null)
        if (originalRow[c].stamp !== null) {
          if (stampIndex < stampsToPlace.length) {
            newRow.push({ stamp: stampsToPlace[stampIndex++] });
            rowHasStamps = true;
          } else {
            // Don't push anything - we've placed all stamps
            break;
          }
        } else {
          // Only push empty cells if we're still placing stamps
          if (stampIndex < stampsToPlace.length) {
            newRow.push({ stamp: null });
          } else {
            break;
          }
        }
    }

      // Only add the row if it has stamps or is part of the original pattern
      if (rowHasStamps || newRow.length > 0) {
        newGrid.push(newRow);
      } else {
        break;
      }
    }

    return newGrid;
  }, [search, sidebarFilteredStamps, initialGridCellsData]);

  console.log("Displayed Grid Cells Data:", displayedGridCellsData);

  // Force re-render with animations when search/reset occurs
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [search]);

  const handleStampClick = (bookId: number) => {
    const book = findBookById(bookId);
    setSelectedBook(book || null);
  };

  return (
    <Router>
      <Header />
      <Routes>
        {/* Default Page (Sidebar + Grid) */}
        <Route 
          path="/" 
          element={
            <div className="main-layout">
              <Sidebar
                search={search}
                onSearchChange={setSearch}
                stamps={sidebarFilteredStamps}
                onStampHover={setHoveredStampId}
                hoveredStampId={hoveredStampId}
                onStampClick={handleStampClick}
              />
              <div 
                className="grid-container"
                style={{ '--grid-visible-height': `${gridVisibleHeight}px` } as React.CSSProperties}
              >
                <IsometricGrid
                  key={key}
                  gridCellsData={displayedGridCellsData}
                  rowStartingColOffsets={rowStartingColOffsets}
                  hoveredStampId={hoveredStampId}
                  onStampHover={setHoveredStampId}
                  onCellHover={setHoveredDetail}
                  onHeightCalculated={setGridVisibleHeight}
                  onStampClick={handleStampClick}
                />
              </div>

              {/* Fixed label + connector overlay */}
              <HoverNameDisplay
                ref={labelBoxRef}
                title={hoveredDetail?.id ? bookTitleMap[hoveredDetail.id] : ''}
                side="right"
                topVh={25}
                leftPercent={65}
                visible={!!hoveredDetail && !isMobile}
              />
              <HoverConnector
                tileEl={hoveredDetail?.el ?? null}
                labelEl={labelBoxRef.current}
                side="right"
                elbowGap={32}
                color="#111"
                width={2}
                snapToIso45={true}
                angleSign={-1}
                visible={!!hoveredDetail && !isMobile}
              />
            </div>
          } 
        />
        {/* About Page */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/downloads" element={<Downloads />} />
      </Routes>
      <div className="footer-container">
        <footer className="footer">
          <div className="footer-left">
          ░▒░ {new Date().getFullYear()} archive.process
          </div>
          <div className="footer-center">
          information wants to be free
          </div>
        </footer>
      </div>
      {selectedBook && (
        <BookPopup 
          book={{ 
            ...selectedBook, 
            isbn: String(selectedBook.isbn),
            images: typeof selectedBook.images === 'string' ? [selectedBook.images] : selectedBook.images
          }} 
          onClose={() => setSelectedBook(null)} 
        />
      )}
    </Router>
  )
}

export default App
