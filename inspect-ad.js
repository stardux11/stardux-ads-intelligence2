async function inspect() {
  const token = 'EAANeqCLE4RkBSZCNzmXadu2ubF2i1MCYhOkmr2geBS98JOGjiqTS9HuYzQ0FKzcI1VstCL72ZBEmY0MgcNfXbRUfz4cMxhwZCZBdRZB51dyQ1RjpdLx2PeesZAeKXliriiUlBRyVsjBBzmOv4tSlaXySRupMxcr1cAh9VMaCMIcqVUY0vDQAZB9hZC7XSSEe';
  const url = 'https://www.facebook.com/ads/archive/render_ad/?id=1018027287969089&access_token=' + token;
  const res = await fetch(url);
  const html = await res.text();
  console.log('HTML length:', html.length);
  
  // Check if it has any errors
  if (html.includes('error') || html.includes('Error')) {
    console.log('Contains error string');
  }
  
  // Look for any media URLs
  const urls = html.match(/https:\/\/[^"'\s<>\\]+/g) || [];
  console.log('Total URLs found:', urls.length);
  const uniqueUrls = [...new Set(urls)];
  console.log('Unique URLs:', uniqueUrls.length);
  uniqueUrls.filter(u => !u.includes('.js') && !u.includes('.css')).forEach(u => console.log('Non-asset URL:', u));
}
inspect();
