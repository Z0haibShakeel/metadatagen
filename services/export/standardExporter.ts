
import { BatchItem, CustomizationConfig } from '../../types/index';

export const generateStandardCSV = (items: BatchItem[], customization: CustomizationConfig) => {
  const header = "File,Title,Description,Keywords,Category";
  
  const rows = items.filter(i => i.metadata.title).map(i => {
      // Apply prefixes/suffixes
      const finalTitle = `${customization.titlePrefix || ''}${i.metadata.title}${customization.titleSuffix || ''}`;
      const finalDesc = `${customization.descriptionPrefix || ''}${i.metadata.description}${customization.descriptionSuffix || ''}`;
      
      // Sanitize for CSV (Escape quotes)
      const safeTitle = finalTitle.replace(/"/g, '""');
      const safeDesc = finalDesc.replace(/"/g, '""');
      const safeKeywords = i.metadata.keywords.join(';').replace(/"/g, '""'); // Semicolon separator for standard
      const safeCategory = (i.metadata.category || "").replace(/"/g, '""');
      
      return `"${i.file.name}","${safeTitle}","${safeDesc}","${safeKeywords}","${safeCategory}"`;
  });

  const csvContent = [header, ...rows].join('\n');
  
  const blob = new Blob([csvContent], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); 
  a.href = url; 
  a.download = 'metadata_standard.csv'; 
  a.click();
  URL.revokeObjectURL(url);
};
