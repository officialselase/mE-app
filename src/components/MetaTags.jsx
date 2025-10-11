import { Helmet } from "react-helmet-async";

const MetaTags = ({
  title = "Ransford Antwi - Full Stack Developer & Software Engineer",
  description = "Experienced full stack developer specializing in React, Node.js, and modern web technologies. View my portfolio, projects, and thoughts on software development.",
  keywords = "full stack developer, software engineer, React, Node.js, JavaScript, web development, portfolio",
  image = `${window.location.origin}/IMG-20230125-WA0001.jpg`,
  url = window.location.href,
  type = "website",
  author = "Ransford Antwi",
  twitterHandle = "@ransfordantwi"
}) => {
  // Ensure title includes site name if not already present
  const fullTitle = title.includes("Ransford Antwi") 
    ? title 
    : `${title} | Ransford Antwi`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Ransford Antwi Portfolio" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#1f2937" />
      <meta name="msapplication-TileColor" content="#1f2937" />
      <meta name="application-name" content="Ransford Antwi Portfolio" />
    </Helmet>
  );
};

export default MetaTags;