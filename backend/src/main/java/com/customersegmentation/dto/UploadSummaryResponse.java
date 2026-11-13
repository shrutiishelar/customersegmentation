package com.customersegmentation.dto;

import java.util.ArrayList;
import java.util.List;

public class UploadSummaryResponse {

    private int totalRows;
    private int validRows;
    private int invalidRows;
    private int duplicateRows;
    private int savedRows;
    private List<RowError> errors = new ArrayList<>();
    private String message;

    public UploadSummaryResponse() {}

    public UploadSummaryResponse(int totalRows, int validRows, int invalidRows, int duplicateRows, int savedRows, List<RowError> errors, String message) {
        this.totalRows = totalRows;
        this.validRows = validRows;
        this.invalidRows = invalidRows;
        this.duplicateRows = duplicateRows;
        this.savedRows = savedRows;
        this.errors = errors != null ? errors : new ArrayList<>();
        this.message = message;
    }

    public static class RowError {
        private int rowNumber;
        private String customerId;
        private String reason;

        public RowError() {}

        public RowError(int rowNumber, String customerId, String reason) {
            this.rowNumber = rowNumber;
            this.customerId = customerId;
            this.reason = reason;
        }

        public int getRowNumber() {
            return rowNumber;
        }

        public void setRowNumber(int rowNumber) {
            this.rowNumber = rowNumber;
        }

        public String getCustomerId() {
            return customerId;
        }

        public void setCustomerId(String customerId) {
            this.customerId = customerId;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    public int getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(int totalRows) {
        this.totalRows = totalRows;
    }

    public int getValidRows() {
        return validRows;
    }

    public void setValidRows(int validRows) {
        this.validRows = validRows;
    }

    public int getInvalidRows() {
        return invalidRows;
    }

    public void setInvalidRows(int invalidRows) {
        this.invalidRows = invalidRows;
    }

    public int getDuplicateRows() {
        return duplicateRows;
    }

    public void setDuplicateRows(int duplicateRows) {
        this.duplicateRows = duplicateRows;
    }

    public int getSavedRows() {
        return savedRows;
    }

    public void setSavedRows(int savedRows) {
        this.savedRows = savedRows;
    }

    public List<RowError> getErrors() {
        return errors;
    }

    public void setErrors(List<RowError> errors) {
        this.errors = errors;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

