interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    siteName?: string;
}

/**
 * SEO Component using React 19's native document metadata hoisting.
 * React 19+ automatically hoists <title>, <meta>, and <link> tags to <head>.
 */
const SEO: React.FC<SEOProps> = ({
    title = 'U Campus',
    description = 'Discover and share innovative ideas, projects, and questions on U Campus - the platform for student collaboration.',
    image = '/assets/images/idea-sample.png',
    url,
    type = 'website',
    siteName = 'U Campus',
}) => {
    const siteUrl = window.location.origin;
    const fullUrl = url || window.location.href;
    const fullImage = image?.startsWith('http') ? image : `${siteUrl}${image}`;
    const fullTitle = title === 'U Campus' ? title : `${title} | U Campus`;

    return (
        <>
            {/* Primary Meta Tags - React 19 hoists these to <head> */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />
        </>
    );
};

export default SEO;
