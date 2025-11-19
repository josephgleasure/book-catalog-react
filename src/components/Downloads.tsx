import React from 'react';

interface DownloadItem {
  name: string;
  description: string;
  size: string;
  driveUrl: string;
}

const Downloads = () => {
  // Define your Google Drive links and download items
  const downloadItems: DownloadItem[] = [
    {
      name: 'Archive.PDF',
      description: 'Partial scrape of the original Archive.PDF website, converted to .JPEGs',
      size: '744 MB - .JPEG',
      driveUrl: 'https://archive.org/details/Archive.PDF'
    },
    {
      name: 'Comme des Garcons Homme Plus Runways 85-93 Herren Uomo',
      description: 'Individual Homme Plus Runways from 1985-1993, originally hosted on Herren Uomo',
      size: '2.38 GB - Multiple Formats',
      driveUrl: 'https://archive.org/details/homme-plus-runways-85-93-herren-uomo'
    },
    {
      name: 'Various Runways & Films - My Clothing Archive',
      description: 'Partial scrape and backup of the My Clothing Archive Youtube channel.',
      size: '9.27 GB - Multiple Formats',
      driveUrl: 'https://archive.org/details/my-clothing-archive-videos'
    },
    {
      name: 'Various Runways 2014-2023- number3store',
      description: 'Runway videos from various designers, originally hosted on number3store',
      size: '19 GB - Multiple Formats',
      driveUrl: 'https://archive.org/details/comme-des-garc-ons-autumn-winter-2020-2021-1080p-25fps-h-264-128kbit-aac'
    },
    {
      name: 'Brutus & Casa Brutus',
      description: 'PDF versions of Japanese lifestyle and interior magazines Brutus & Casa Brutus',
      size: '1.07 MB - PDFs',
      driveUrl: 'https://archive.org/details/casa-brutus'
    },
    {
      name: 'Fruits Volume 1-50',
      description: 'Reupload of the original torrent of the legendary streetstyle magazine.',
      size: '570 MB - PDFs',
      driveUrl: 'https://archive.org/details/fruits-1-50'
    },
    {
      name: 'Levis ICD+ Research',
      description: 'All of the digital research resources for the Levis ICD+ article',
      size: '232 MB - Multiple Formats',
      driveUrl: 'https://archive.org/details/levis-icd'
    },
    {
        name: 'Japanese Magazine Archive',
        description: 'The Japanese Magazine Google Drive folder that has been floating around the internet for the last few years. Popeye and Go Out issues have been removed and resorted.',
        size: '13.7 GB - Multiple Formats',
        driveUrl: 'https://drive.google.com/drive/folders/0B0jc0NJQ4qefcXdpS3hoNjlySjg?resourcekey=0-2ZsYev2oUDgKMs06qHr6uQ', 
   }, 
      {
        name: 'Partial & Rough Scans',
        description: 'Hodge podge of various scans from over the years, not organized.',
        size: '10.1 GB - Multiple Formats',
        driveUrl: 'https://archive.org/details/undercover-tgraphics'
      },
      {
        name: 'POPEYE',
        description: 'Scans of the iconic magazine for City Boys',
        size: '2.43 GB - Multiple Formats',
        driveUrl: 'https://archive.org/details/popeye-archive'
      },
      {
        name: 'GO OUT Magazine',
        description: 'Selection of Japanese outdooring magazing GO OUT.',
        size: '5.89 GB - Multiple Formats',
        driveUrl: 'https://archive.org/details/go-out-magazine'
      },
  ];

  const handleDownload = (driveUrl: string) => {
    window.open(driveUrl, '_blank');
  };

  const downloadButtonStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '1.5rem',
    marginBottom: '1rem',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    textAlign: 'left',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.2s ease',
    fontSize: '1rem'
  };

  const downloadButtonHoverStyle: React.CSSProperties = {
    ...downloadButtonStyle,
    backgroundColor: '#e9ecef',
    borderColor: '#adb5bd',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  };

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Downloads</h1>

      <p>
        
          We try to compile and offer as many resources as we possibly can. All of these resources are scanned, scraped, or otherwise collected, and compiled by the site owner. Please note that these downloads are not optimized for browsing and are best suited for data hoarders or users looking for local/offline access to these resources.
        
      </p>

      <p>
        <em>
          If you have scans or resources you'd like to contribute (or if you are a copright holder and would like something taken down), get in touch by sending an email to{" "}
          <a
            href={`mailto:${"objectprocess"}@${"gmail.com"}`}
            style={{ textDecoration: "underline", color: "blue" }}
          >
            {`objectprocess@gmail.com`}
          </a>
        </em>
      </p>

      <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', marginTop: '2rem' }}>Available Downloads</h2>

      <div style={{
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <p style={{ margin: '0', fontSize: '0.9rem', color: '#6c757d' }}>
          <strong>Note:</strong> Clicking a download button will open an Internet Archive page where you can preview and download all associated files. 
        </p>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {downloadItems.map((item) => (
          <button
            key={item.name}
            style={downloadButtonStyle}
            onClick={() => handleDownload(item.driveUrl)}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, downloadButtonHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, downloadButtonStyle);
            }}
          >
            <div style={{ 
              fontWeight: '700', 
              fontSynthesis: 'weight',
              fontSize: '1.1rem', 
              marginBottom: '0.5rem',
              color: '#212529'
            }}>
              {item.name}
            </div>
            <div style={{ 
              color: '#6c757d', 
              marginBottom: '0.5rem',
              fontSize: '0.95rem'
            }}>
              {item.description}
            </div>
            <div style={{ 
              color: '#495057', 
              fontSize: '0.85rem',
              fontWeight: '500'
            }}>
              {item.size}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Downloads;