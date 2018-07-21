import * as filesize from "filesize";
import * as React from "react";
import { BookFull } from "../../domain/core";

export interface EbookDownloadLinksProps {
  book: BookFull;
}

export function EbookDownloadLinks(props: EbookDownloadLinksProps) {
  const book: BookFull = props.book;

  return (
    <div className="ebook-download-links-container">
      <h6>Download</h6>
      <div className="ebook-download-links">
        {book.epubSize ? <DownloadLink type="epub" size={book.epubSize} /> : ""}
        {book.mobiSize ? <DownloadLink type="mobi" size={book.mobiSize} /> : ""}
      </div>
    </div>
  );
}

interface DownloadLinkProps {
  type: string;
  size: number;
}

function DownloadLink(props: DownloadLinkProps) {
  return (
    <span className="download-link-container">
      <a href="javascript:void(0);" className={`download-link ${props.type}`}>
        {props.type} ({filesize(props.size)})
      </a>
    </span>
  );
}
