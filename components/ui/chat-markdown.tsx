"use client";

import React from "react";

interface ChatMarkdownProps {
  content: string;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  if (!content) return null;

  // Split content into blocks (paragraphs, tables, lists, headers)
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];
  let currentListType: "bullet" | "number" | null = null;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      if (currentListType === "bullet") {
        elements.push(
          <ul key={key} className="my-2 space-y-1.5 pl-2 text-xs sm:text-sm text-[#4f351c]">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#cfab71] font-bold mt-0.5">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        );
      } else if (currentListType === "number") {
        elements.push(
          <ol key={key} className="my-2 space-y-1.5 pl-2 text-xs sm:text-sm text-[#4f351c]">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#fcf3e3] border border-[#e8decf] text-[#713105] text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      listItems = [];
      currentListType = null;
    }
  };

  const flushTable = (key: string) => {
    if (inTable && tableHeader.length > 0) {
      elements.push(
        <div
          key={key}
          className="my-3 overflow-x-auto rounded-xl border border-[#e8decf] bg-white shadow-sm"
        >
          <table className="w-full text-left text-xs border-collapse min-w-[280px]">
            <thead>
              <tr className="bg-[#4f351c] text-[#fff7e8] border-b border-[#e8decf]">
                {tableHeader.map((th, idx) => (
                  <th
                    key={idx}
                    className="py-2 px-3 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap"
                  >
                    {renderInlineFormatting(th)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8decf]">
              {tableRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`transition-colors ${
                    rIdx % 2 === 0 ? "bg-white" : "bg-[#fff7e8]/40"
                  } hover:bg-[#fcf3e3]/70`}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-3 text-[#341100] text-xs">
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 1. Table Row Detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList(`list-before-table-${index}`);
      const rawCols = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());

      // Check if it's separator row (e.g. |---|---|)
      const isSeparator = rawCols.every((c) => /^[-:\s]+$/.test(c));

      if (isSeparator) {
        // Just column separator; ignore and maintain table state
        return;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = rawCols;
      } else {
        tableRows.push(rawCols);
      }
      return;
    } else if (inTable) {
      flushTable(`table-${index}`);
    }

    // 2. Headings
    if (trimmed.startsWith("### ")) {
      flushList(`list-before-h3-${index}`);
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-xs sm:text-sm font-bold text-[#341100] mt-3 mb-1 border-b border-[#e8decf]/60 pb-1"
        >
          {renderInlineFormatting(trimmed.replace(/^###\s+/, ""))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList(`list-before-h2-${index}`);
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-sm sm:text-base font-bold text-[#341100] mt-3.5 mb-1.5"
        >
          {renderInlineFormatting(trimmed.replace(/^##\s+/, ""))}
        </h2>
      );
      return;
    }

    // 3. Bullet Lists (- or * or •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (currentListType && currentListType !== "bullet") {
        flushList(`list-switch-${index}`);
      }
      currentListType = "bullet";
      listItems.push(renderInlineFormatting(bulletMatch[1]));
      return;
    }

    // 4. Numbered Lists (1. or 2.)
    const numberMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      if (currentListType && currentListType !== "number") {
        flushList(`list-switch-${index}`);
      }
      currentListType = "number";
      listItems.push(renderInlineFormatting(numberMatch[1]));
      return;
    }

    // 5. Normal Paragraphs or Empty Lines
    flushList(`list-before-p-${index}`);

    if (trimmed === "") {
      elements.push(<div key={`spacer-${index}`} className="h-1.5" />);
      return;
    }

    elements.push(
      <p key={`p-${index}`} className="my-1.5 text-xs sm:text-sm text-[#341100] leading-relaxed">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });

  // Final flushes if file ends in list or table
  flushList("final-list");
  flushTable("final-table");

  return <div className="space-y-1">{elements}</div>;
}

// Formats inline bold, code, and contextual status badges
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return "";

  // Split by bold markers **text** or inline code `code`
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);

      // Check for status badge pills
      const upper = inner.toUpperCase();
      if (upper === "IN STOCK" || upper === "SUCCESS" || upper === "COMPLETED" || upper === "PAID") {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.2 rounded font-semibold text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200 mx-0.5"
          >
            {inner}
          </span>
        );
      }
      if (
        upper === "LOW STOCK" ||
        upper === "WARNING" ||
        upper === "PENDING" ||
        upper === "UNPAID"
      ) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.2 rounded font-semibold text-[10px] uppercase tracking-wide bg-amber-50 text-[#713105] border border-amber-200 mx-0.5"
          >
            {inner}
          </span>
        );
      }
      if (
        upper === "OUT OF STOCK" ||
        upper === "SECURITY" ||
        upper === "CANCELLED" ||
        upper === "OVERDUE" ||
        upper === "DESTRUCTIVE"
      ) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.2 rounded font-semibold text-[10px] uppercase tracking-wide bg-red-50 text-red-800 border border-red-200 mx-0.5"
          >
            {inner}
          </span>
        );
      }

      return (
        <strong key={index} className="font-semibold text-[#341100]">
          {inner}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="font-mono text-[11px] font-medium bg-[#fcf3e3] text-[#713105] border border-[#e8decf] px-1 py-0.5 rounded"
        >
          {code}
        </code>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
