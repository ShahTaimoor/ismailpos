import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import { useGetBalanceSummaryQuery } from '../store/services/customerBalancesApi';
import PrintDocument from './PrintDocument';
import { PrintModal, PrintWrapper } from './print';
import { PRINT_PAGE_STYLE } from './print/printPageStyle';
import { FileSpreadsheet } from 'lucide-react';
import { LoadingButton } from './LoadingSpinner';
import { toast } from 'sonner';

/**
 * DirectPrintInvoice - Triggers print dialog directly without opening the preview modal.
 * Renders content off-screen and calls print immediately.
 */
export const DirectPrintInvoice = ({
  orderData,
  documentTitle = 'Invoice',
  partyLabel = 'Customer',
  onComplete
}) => {
  const { companyInfo: companySettings } = useCompanyInfo();
  const resolvedDocumentTitle = documentTitle || 'Invoice';
  const printRef = useRef(null);

  const customerId =
    orderData?.customer_id ||
    orderData?.customerId ||
    orderData?.customer?._id ||
    orderData?.customer?.id ||
    orderData?.customer?.customerId ||
    null;

  const { data: balanceSummaryData } = useGetBalanceSummaryQuery(customerId, {
    skip: !customerId
  });

  const ledgerBalance =
    balanceSummaryData?.data?.balances?.currentBalance ??
    balanceSummaryData?.balances?.currentBalance ??
    null;

  const handlePrint = useCallback(() => {
    if (printRef.current?.print) {
      printRef.current.print();
    }
  }, []);

  useEffect(() => {
    if (orderData) {
      const timer = setTimeout(handlePrint, 150);
      return () => clearTimeout(timer);
    }
  }, [orderData, handlePrint]);

  const handleAfterPrint = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  if (!orderData) return null;

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: 0, visibility: 'hidden' }} aria-hidden="true">
      <PrintWrapper
        ref={printRef}
        documentTitle={resolvedDocumentTitle}
        pageStyle={PRINT_PAGE_STYLE}
        onAfterPrint={handleAfterPrint}
      >
        <PrintDocument
          companySettings={companySettings || {}}
          orderData={orderData}
          ledgerBalance={ledgerBalance}
          printSettings={{
            ...companySettings?.printSettings,
            headerText: companySettings?.printSettings?.headerText,
            footerText: companySettings?.printSettings?.footerText
          }}
          documentTitle={resolvedDocumentTitle}
          partyLabel={partyLabel}
        />
      </PrintWrapper>
    </div>
  );
};

/**
 * Invoice Print Modal - Sale invoices, Purchase invoices, Sale returns.
 * Uses centralized PrintModal + PrintWrapper (react-to-print).
 */
const InvoicePrintModal = ({
  isOpen,
  onClose,
  orderData,
  documentTitle = 'Invoice',
  partyLabel = 'Customer',
  autoPrint = false,
  onExportExcel,
  onDownloadFile,
}) => {
  const { companyInfo: companySettings } = useCompanyInfo();
  const resolvedDocumentTitle = documentTitle || 'Invoice';

  const customerId =
    orderData?.customer_id ||
    orderData?.customerId ||
    orderData?.customer?._id ||
    orderData?.customer?.id ||
    orderData?.customer?.customerId ||
    null;

  const { data: balanceSummaryData } = useGetBalanceSummaryQuery(customerId, {
    skip: !customerId
  });

  const ledgerBalance =
    balanceSummaryData?.data?.balances?.currentBalance ??
    balanceSummaryData?.balances?.currentBalance ??
    null;

  // Mutations for Sales
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    if (!onExportExcel || !onDownloadFile) {
      toast.error('Export functionality not provided.');
      return;
    }
    if (!orderData) return;

    try {
      setIsExporting(true);
      const orderNumber = orderData?.order_number || orderData?.orderNumber || orderData?.so_number || orderData?.soNumber ||
        orderData?.invoiceNumber || orderData?.invoice_number;

      if (!orderNumber) {
        toast.error('Reference number not found');
        return;
      }

      // 1. Export the invoice to generate the file
      const response = await onExportExcel({ search: orderNumber }).unwrap();

      if (response?.filename) {
        const filename = response.filename;

        // 2. Download the generated file
        // Note: We check if it's a lazy query (has .error) or a mutation (throws/unwraps)
        let blob;
        const downloadResult = await onDownloadFile(filename);

        // Handle both lazy query results and mutation results
        if (downloadResult && 'data' in downloadResult) {
          if (downloadResult.error) throw new Error('Download failed');
          blob = downloadResult.data;
        } else {
          blob = downloadResult;
        }

        if (!blob) throw new Error('No data received');

        // 3. Trigger browser download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Excel file downloaded successfully');
      }
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error(error?.message || error?.data?.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const excelButton = (
    <LoadingButton
      onClick={handleExportExcel}
      isLoading={isExporting}
      variant="secondary"
      className="flex items-center gap-2"
      disabled={!orderData}
      title="Export Invoice to Excel"
    >
      <FileSpreadsheet className="h-4 w-4" />
      Excel
    </LoadingButton>
  );

  return (
    <PrintModal
      isOpen={isOpen}
      onClose={onClose}
      documentTitle={resolvedDocumentTitle}
      hasData={!!orderData}
      emptyMessage="No invoice data to print."
      autoPrint={autoPrint}
      additionalFooterActions={(onExportExcel && onDownloadFile) ? excelButton : null}
    >
      <PrintDocument
        companySettings={companySettings || {}}
        orderData={orderData}
        ledgerBalance={ledgerBalance}
        printSettings={{
          ...companySettings?.printSettings,
          headerText: companySettings?.printSettings?.headerText,
          footerText: companySettings?.printSettings?.footerText
        }}
        documentTitle={resolvedDocumentTitle}
        partyLabel={partyLabel}
      />
    </PrintModal>
  );
};

export default InvoicePrintModal;
