"use client";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState } from "react";
import { Loader2Icon, Rocket, RotateCw, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "./ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// function to render the pdf using react-pdf package
function PdfView({ url }: { url: string }) {
  const [numPages, setnumPages] = useState<number>();
  const [pageNumber, setpageNumber] = useState<number>(1);
  const [file, setfile] = useState<Blob | null>(null);
  const [rotation, setrotation] = useState<number>(0);
  const [scale, setscale] = useState<number>(1);

  useEffect(() => {
    const fetchFile = async () => {
      console.log("Fetching PDF from URL:", url);
      try {
        const response = await fetch(url);
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const file = await response.blob();
        console.log("Fetched file:", file);

        if (file.type !== "application/pdf") {
          throw new Error("Fetched file is not a PDF.");
        }

        setfile(file);
        console.log("PDF file set in state");
      } catch (error) {
        console.error("Error fetching PDF file:", error);
      }
    };

    if (url) {
      fetchFile();
    } else {
      console.error("No URL provided for the PDF.");
    }
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setnumPages(numPages);
    console.log("PDF loaded successfully with numPages:", numPages);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="sticky top-0 z-50 bg-gray-100 p-2 rounded-b-lg">
        <div className="max-w-6xl grid grid-cols-6 gap-2">
          <Button
            variant="outline"
            disabled={pageNumber === 1}
            onClick={() => {
              if (pageNumber > 1) {
                setpageNumber(pageNumber - 1);
              }
            }}
          >
            Previous
          </Button>
          <p className="flex items-center justify-center">
            {pageNumber} of {numPages}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (numPages) {
                if (pageNumber < numPages) {
                  setpageNumber(pageNumber + 1);
                }
              }
            }}
          >
            Next
          </Button>
          <Button
            variant="outline"
            onClick={() => setrotation((rotation + 90) % 360)}
          >
            <RotateCw />
          </Button>

          <Button
            variant="outline"
            disabled={scale >= 1.5}
            onClick={() => {
              setscale(scale * 1.2);
            }}
          >
            <ZoomInIcon />
          </Button>

          <Button
            variant="outline"
            disabled={scale <= 0.75}
            onClick={() => {
              setscale(scale / 1.2);
            }}
          >
            <ZoomOutIcon/>
          </Button>
        </div>
      </div>
      {!file ? (
        <Loader2Icon className="animate-spin h-20 w-20 text-purple-600 mt-20" />
      ) : (
        <Document
          loading={null}
          file={file}
          rotate={rotation}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => {
            console.error("Error loading PDF:", error);
            alert("Failed to load PDF. Please try again later.");
          }}
          className="m-4"
        >
          <Page className="shadow-lg" scale={scale} pageNumber={pageNumber} />
        </Document>
      )}
    </div>
  );
}

export default PdfView;
