export const formatMarkdown = (text: string): string => {
  // Convert **text** to <strong>text</strong>
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *text* to <em>text</em>
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert `code` to <code>code</code>
  text = text.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
  
  // Convert URLs to links
  text = text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
  );
  
  // Convert newlines to <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
};