import './globals.css';

export const metadata = {
  metadataBase: new URL('https://horsepower.ma'),
  title: 'Horsepower.ma — Prix des voitures neuves au Maroc',
  description: 'Tous les prix des voitures neuves au Maroc, essais vidéo en darija, comparatifs et classement prix par cheval.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
