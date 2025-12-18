
import { BatchItem, CustomizationConfig } from '../../types/index';

export const generateAdobeCSV = (items: BatchItem[], customization: CustomizationConfig) => {
  // Adobe Stock Format: Filename, Title, Keywords, Category
  const header = "Filename,Title,Keywords,Category";
  
  const rows = items.filter(i => i.metadata.title).map(i => {
      // Apply prefixes/suffixes
      const finalTitle = `${customization.titlePrefix || ''}${i.metadata.title}${customization.titleSuffix || ''}`;
      
      // Sanitize for CSV
      const safeTitle = finalTitle.replace(/"/g, '""');
      // Adobe uses commas for keywords, usually enclosed in quotes
      const safeKeywords = i.metadata.keywords.join(',').replace(/"/g, '""'); 
      
      // Extract Category Number only (e.g., "19: Technology" -> "19")
      let categoryNum = "";
      if (i.metadata.category) {
          const parts = i.metadata.category.split(':');
          if (parts.length > 0) {
              categoryNum = parts[0].trim();
          }
      }
      
      return `"${i.file.name}","${safeTitle}","${safeKeywords}","${categoryNum}"`;
  });

  const csvContent = [header, ...rows].join('\n');
  
  const blob = new Blob([csvContent], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); 
  a.href = url; 
  a.download = 'metadata_adobe_stock.csv'; 
  a.click();
  URL.revokeObjectURL(url);
};
