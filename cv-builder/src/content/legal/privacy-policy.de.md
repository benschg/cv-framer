# Datenschutzerklärung

**Letzte Aktualisierung:** {{lastUpdated}}
**Gültig ab:** {{effectiveDate}}
**Version:** {{version}}

---

## Einleitung

Willkommen bei CV Builder. Wir respektieren Ihre Privatsphäre und verpflichten uns, Ihre persönlichen Daten zu schützen. Diese Datenschutzerklärung erklärt, wie wir Ihre Informationen sammeln, verwenden, speichern und schützen, wenn Sie unsere CV-Building-Plattform nutzen.

Diese Richtlinie gilt für alle Nutzer unseres Dienstes und entspricht der Datenschutz-Grundverordnung (DSGVO).

---

## 1. Welche Informationen wir sammeln

### 1.1 Kontoinformationen

- **E-Mail-Adresse** (erforderlich für E-Mail-OTP und Google OAuth)
- **Authentifizierungsdaten** einschließlich Login-Zeitstempel
- **Google-Profilinformationen** (bei Google-Anmeldung): Name, Profilbild, Google-Benutzer-ID

### 1.2 Profilinformationen

- **Grundlegende Angaben:** Vor- und Nachname, Telefonnummer, Standort, Zeitzone
- **Professionelle Links:** LinkedIn, GitHub, Website, Portfolio
- **Profilfotos:** Hochgeladene Bilder (in öffentlichem Speicher)
- **Berufliche Zusammenfassung:** Ihr Slogan und Ihre Biografie
- **Sprachpräferenz:** Englisch oder Deutsch

### 1.3 Karrieredaten

- **Berufserfahrung:** Firmennamen, Positionen, Standorte, Beschäftigungsdaten, Beschreibungen
- **Ausbildung:** Institutionen, Abschlüsse, Fachrichtungen, Daten, Noten
- **Fähigkeiten:** Kategorisierte technische und Soft Skills
- **Zertifizierungen:** Namen, Aussteller, Daten, hochgeladene Zertifikatsdokumente (PDF, Bilder)
- **Referenzen:** Namen, Titel, Firmen, Kontaktinformationen, hochgeladene Referenzschreiben
- **Kernkompetenzen:** Fachliche Kompetenzen mit Beschreibungen

### 1.4 Werbeflächeninhalte

Strukturierte Inhalte in 18 Kategorien:

- Kurzprofil, Berufliche Erfahrungen, Aus- & Weiterbildungen
- Kernkompetenzen, Branchenexpertise, Sprachkenntnisse
- Soft Skills, Technische Fähigkeiten, Methodenkompetenzen, Führungskompetenzen
- Projekterfahrungen, Erfolge & Referenzen, Zertifizierungen
- Publikationen, Ehrenamtliche Tätigkeiten, Interessen & Hobbys
- Ziele & Motivation, Unique Value Proposition

### 1.5 Dokumente und Dateien

- **Lebensläufe:** Generierte CVs mit individueller Formatierung
- **Anschreiben:** KI-generierte oder manuell verfasste Anschreiben
- **Bewerbungen:** Firmennamen, Stellentitel, URLs, Bewerbungsstatus
- **Hochgeladene Dateien:** PDF, DOCX, TXT (max. 5-10MB) zur Datenextraktion

### 1.6 Share-Link-Analysen

Wenn Sie einen öffentlichen Share-Link erstellen, erfassen wir:

- **Besucher-IP-Adresse** (nach 90 Tagen anonymisiert)
- **User-Agent** (Browser- und Gerätetyp)
- **HTTP-Referrer** (Quelle des Besuchs)
- **Besuchszeitpunkt** und Anzahl der Aufrufe

**Hinweis:** Dies ist die **einzige Analyse**, die wir durchführen. Wir verwenden **kein** Google Analytics, Tracking-Pixel oder Werbe-Cookies.

---

## 2. Wie wir Ihre Informationen verwenden

### 2.1 Kerndienste

- **Kontoverwaltung:** Erstellen und Sichern Ihres Kontos
- **CV-Generierung:** Erstellen professioneller Lebensläufe und Anschreiben
- **Inhaltsspeicherung:** Sichere Speicherung Ihrer Profil- und Karrieredaten
- **Bewerbungsverfolgung:** Organisieren Ihrer Jobsuche

### 2.2 KI-gestützte Funktionen

Wir verwenden **Google Gemini AI**, um Ihr Erlebnis zu verbessern:

**An Google Gemini AI gesendete Daten:**
- Alle Werbeflächeninhalte (18 Kategorien)
- Ihre CV-Inhalte und Anschreiben
- Von Ihnen eingefügte Stellenausschreibungen
- Hochgeladene Dateien (PDFs, Bilder) zur Datenextraktion

**Verwendete KI-Modelle:**
- gemini-2.0-flash (primär)
- gemini-1.5-pro (erweiterte Aufgaben)
- gemini-1.5-flash (schnelle Verarbeitung)

**KI-Funktionen:**
- CV-Inhaltsgenerierung aus Ihrem Profil
- Anschreiben-Generierung
- Dokumentenextraktion aus hochgeladenen CVs
- Zertifikatsanalyse
- Referenzschreiben-Analyse
- Job-Fit-Analyse

**Ihre Kontrolle:** Alle KI-Funktionen sind optional. Sie können alle Inhalte manuell erstellen.

**Wichtig:** An Google gesendete Daten werden gemäß [Googles Datenschutzrichtlinie](https://policies.google.com/privacy) verarbeitet.

---

## 3. Datenspeicherung und Sicherheit

### 3.1 Speicherinfrastruktur

Wir verwenden **Supabase** für alle Datenspeicherung:

- **Datenbank:** PostgreSQL mit Row Level Security (RLS)
- **Dateispeicher:** Supabase Storage:
  - `profile-photos` — **ÖFFENTLICH**
  - `certification-documents` — **PRIVAT**
  - `reference-letters` — **PRIVAT**
  - `uploaded-cvs` — **PRIVAT**

**Standort:** {{dataLocation}}

### 3.2 Sicherheitsmaßnahmen

- **Row Level Security (RLS):** Nutzer können **nur** auf ihre eigenen Daten zugreifen
- **Verschlüsselte Verbindungen:** Alle Daten über HTTPS/TLS übertragen
- **Sichere Authentifizierung:** OAuth 2.0 (Google) und One-Time Password (E-Mail-OTP)
- **Kaskadenlöschung:** Alle Ihre Daten werden automatisch gelöscht, wenn Sie Ihr Konto löschen

### 3.3 Datenaufbewahrung

- **Aktive Konten:** Daten werden unbegrenzt gespeichert, während Ihr Konto aktiv ist
- **Kontolöschung:** Alle Daten werden innerhalb von {{backupDeletionDays}} Tagen dauerhaft gelöscht
- **Share-Link-Analysen:** Besucherdaten werden {{analyticsMonths}} Monate aufbewahrt

---

## 4. Drittanbieterdienste

### 4.1 Supabase

- **Anbieter:** Supabase Inc.
- **Zweck:** Datenbank, Authentifizierung und Dateispeicher
- **Datenschutz:** [https://supabase.com/privacy](https://supabase.com/privacy)

### 4.2 Google Gemini AI

- **Anbieter:** Google LLC
- **Zweck:** KI-Inhaltsgenerierung und Dokumentenanalyse
- **Datenschutz:** [https://policies.google.com/privacy](https://policies.google.com/privacy)

### 4.3 Google OAuth (Optional)

- **Anbieter:** Google LLC
- **Zweck:** Nur Authentifizierung (kein Tracking)
- **Datenschutz:** [https://policies.google.com/privacy](https://policies.google.com/privacy)

---

## 5. Ihre Datenschutzrechte (DSGVO)

Sie haben das Recht auf:

- **Auskunft:** Laden Sie eine Kopie aller Ihrer Daten herunter (JSON-Export)
- **Berichtigung:** Aktualisieren oder korrigieren Sie Ihre Informationen
- **Löschung:** Beantragen Sie die Löschung Ihres Kontos und aller Daten
- **Datenübertragbarkeit:** Exportieren Sie Ihre Daten in maschinenlesbarem Format
- **Einschränkung:** Beschränken Sie die Verarbeitung Ihrer Daten
- **Widerspruch:** Widersprechen Sie bestimmten Arten der Verarbeitung
- **Widerruf der Einwilligung:** Deaktivieren Sie optionale Funktionen (z. B. KI) jederzeit
- **Beschwerde:** Wenden Sie sich an Ihre lokale Datenschutzbehörde

### Ausübung Ihrer Rechte

- **In der App:** Einstellungen > Konto > Datenschutzkontrollen
- **E-Mail:** {{privacyEmail}}
- **Antwortzeit:** Wir antworten innerhalb von 30 Tagen

---

## 6. Cookies und Tracking

### 6.1 Notwendige Cookies

- **Authentifizierungstokens:** Halten Sie sicher angemeldet
- **Präferenzen:** Merken Sie sich Sprach- und Theme-Einstellungen
- **Sicherheitstokens:** Verhindern CSRF-Angriffe

### 6.2 Keine Analysen

Wir verwenden **NICHT**:

- Google Analytics
- Werbe-Cookies von Drittanbietern
- Social-Media-Tracking-Pixel

Die **einzige Analyse** erfolgt bei **öffentlichen CV-Share-Links**.

---

## 7. Datenschutz für Kinder

Unser Service ist **nicht für Nutzer unter {{minimumAge}} Jahren** bestimmt. Wenn Sie glauben, dass ein Kind uns persönliche Informationen zur Verfügung gestellt hat, kontaktieren Sie uns bitte unter {{privacyEmail}}.

---

## 8. Internationale Datenübermittlungen

- **Datenstandort:** {{dataLocation}}
- **EU-Nutzer:** Ihre Daten können außerhalb des EWR übermittelt werden
- **Schutzmaßnahmen:** Wir verwenden Standardvertragsklauseln (SCCs) mit unseren Dienstleistern
- **Drittländer:** Google (USA), Supabase ({{supabaseRegion}})

---

## 9. Weitergabe Ihrer Daten

Wir **verkaufen** Ihre persönlichen Informationen **nicht** an Dritte.

Wir teilen Daten nur mit:

1. **Supabase:** Für Datenbank, Authentifizierung und Speicher
2. **Google:** Für KI-Verarbeitung (bei Nutzung von KI-Funktionen) und OAuth
3. **Rechtsbehörden:** Wenn gesetzlich vorgeschrieben

---

## 10. Änderungen dieser Richtlinie

- **Benachrichtigungen:** Wir benachrichtigen Sie per E-Mail über wesentliche Änderungen
- **Gültigkeitsdatum:** Änderungen treten 30 Tage nach Veröffentlichung in Kraft
- **Fortgesetzte Nutzung:** Die Nutzung des Dienstes nach Änderungen gilt als Zustimmung

---

## 11. Kontakt

**Datenverantwortlicher:**

{{companyName}}
{{companyAddress}}
{{companyCity}}
{{companyCountry}}

**Datenschutzanfragen:**

E-Mail: {{privacyEmail}}
Betreff: "Datenschutzanfrage - CV Builder"

**Antwortzeit:** Wir antworten auf alle Datenschutzanfragen innerhalb von 7 Werktagen.

---

## Zusammenfassung

- ✅ **Kein Datenverkauf:** Wir verkaufen niemals Ihre persönlichen Daten
- ✅ **Ihre Kontrolle:** Sie besitzen Ihre Daten und können sie jederzeit löschen
- ✅ **KI optional:** Alle KI-Funktionen sind optional
- ✅ **Sichere Speicherung:** Row Level Security und Verschlüsselung
- ✅ **Begrenzte Analysen:** Nur bei öffentlichen CV-Shares
- ✅ **DSGVO-konform:** Volle Daten-, Export- und Löschrechte

Bei Fragen kontaktieren Sie uns unter {{privacyEmail}}.
