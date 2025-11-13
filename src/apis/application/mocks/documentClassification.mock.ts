export const mockDocumentClassification = {
    id: 'doc-class-1',
    name: 'not_classified',
    displayName: 'Not Classified',
    systemDefault: 'NOT_CLASSIFIED',
};

export const mockDocumentClassificationOption = {
    value: mockDocumentClassification.name,
    label: mockDocumentClassification.displayName,
};

export const mockDocumentClassificationOptions = [mockDocumentClassificationOption];

export const mockDocumentClassifications = [mockDocumentClassification];
