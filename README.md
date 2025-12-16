# 👻 IRL Gjemsel

**Et fysisk gjemselspill hvor du løper fra spøkelser i virkeligheten!**

IRL Gjemsel er et nyskapende mobilspill som kombinerer kartelementer med fysisk aktivitet. Spillet bruker GPS-posisjoneringen din til å plassere deg på et kart, mens AI-styrte spøkelser prøver å finne deg. Du må faktisk bevege deg fysisk for å unngå å bli oppdaget!

## 🎮 Hvordan det fungerer

1. **Start spillet** - Gi nettleseren tilgang til GPS-posisjonen din
2. **Gjem deg** - Når nedtellingen starter har du 20 sekunder på å finne et godt gjemmested
3. **Løp for livet** - Unngå spøkelsenes synsfelt ved å bevege deg fysisk
4. **Overlev lengst mulig** - Jo lenger du holder deg i live, jo høyere score!

### Spillmekanikk

- **🔵 Du** - Den blå prikken på kartet viser din faktiske GPS-posisjon
- **🔴 Spøkelser** - Røde prikker med lyskjegler som representerer hva de kan se
- **🟢 Spilleområde** - Grønn avgrensning som definerer hvor du kan bevege deg
- **⏰ Områdekrymp** - Etter 2 minutter krymper spilleområdet til 80% av opprinnelig størrelse
- **🆕 Nye spøkelser** - Nye spøkelser dukker opp med jevne mellomrom
- **🏆 Toppliste** - De 10 beste spillerne med lengst overlevelsestid

### Spøkelsenes oppførsel

Spøkelsene har tre modi:
- **Patruljering** - Beveger seg tilfeldig rundt i området
- **Jakt** - Når de ser deg, jager de deg direkte
- **Søk** - Hvis de mister syne på deg, fortsetter de å søke på siste kjente posisjon

## 🛠️ Teknologier

Prosjektet er bygget med følgende teknologier:

### Frontend
- **HTML5 + Vanilla JavaScript** - Ingen rammeverk, ren og rask kode
- **Leaflet.js** - Interaktive kart og GPS-visualisering
- **Turf.js** - Geografiske beregninger (avstander, retninger, synsfelt)
- **Geolocation API** - Høy-nøyaktighet GPS-sporing

### Backend & Database
- **Firebase Realtime Database** - Sanntids toppliste som synkroniserer mellom alle spillere
- **Firebase Hosting** - Rask og pålitelig hosting med global CDN

### Kartdata
- **OpenStreetMap** - Gratis og åpne kartdata

## 🚀 Deployment

Prosjektet er deployet via Firebase Hosting.

For å deploye din egen versjon, konfigurer Firebase Hosting og oppdater Firebase-konfigurasjonen i `index.html`.

### Deployment-prosess
1. Firebase-konfigurasjonen er inkludert i `index.html`
2. Prosjektet hostes som en statisk side
3. Firebase Realtime Database håndterer topplisten
4. Ingen build-steg nødvendig - deployer direkte

## ⚙️ Innstillinger

Spillet har flere justerbare parametere:

- **Antall spøkelser** - Velg mellom 1-100 spøkelser (standard: 5)
- **Hastighet** - Juster spøkelsenes bevegelseshastighet i m/s (standard: 5.5)
- **Synsfelt (FOV)** - Endre hvor bredt spøkelsene kan se i grader (standard: 95°)
- **Synsrekkevidde** - Hvor langt spøkelsene kan se i meter (standard: 70m)
- **GeoJSON-avgrensning** - Last opp et eget polygon for å definere spilleområdet

## 📱 Bruksanvisning

### Første gangs oppsett
1. Åpne spillet i en mobilnettleser (Chrome anbefales)
2. Gi tillatelse til posisjonssporing når nettleseren ber om det
3. Vent til kartet sentrerer seg på din posisjon

### Starte et spill
1. Juster innstillinger etter ønske (valgfritt)
2. Trykk på "Start (20s gjemmetid)"
3. Løp til et gjemmested i løpet av nedtellingen
4. Hold deg unna spøkelsenes synsfelt så lenge som mulig!

### Tips og triks
- 👀 Hold øye med både kartet og omgivelsene dine
- 🏃‍♂️ Beveg deg strategisk - unngå å bli fanget i hjørner
- ⏰ Husk at området krymper etter 2 minutter
- 🎯 Prøv å holde deg utenfor spøkelsenes lyskjegler
- 📊 Eksperimenter med innstillingene for å finne passe vanskelighetsgrad

## 🚧 Begrensninger og kjente problemer

### GPS-nøyaktighet
- Spillet er avhengig av GPS-signalet på enheten din
- I byområder med høye bygninger kan GPS-nøyaktigheten være redusert
- Innendørs fungerer spillet dårlig eller ikke i det hele tatt

### Nettleserstøtte
- Krever en moderne nettleser med støtte for Geolocation API
- Fungerer best på mobile enheter med GPS
- Wake Lock API brukes for å holde skjermen aktiv under spill

### Batterilevetid
- GPS-sporing og konstant skjerm bruker mye batteri
- Anbefaler å ha tilstrekkelig batterinivå før start

### Sikkerhet
- ⚠️ Pass på omgivelsene! Se opp for biler, stolper og andre farer
- ⚠️ Spill i trygge områder hvor det er greit å løpe rundt
- ⚠️ Ikke spill i trafikken eller farlige områder

### Ytelse
- Mange spøkelser samtidig kan påvirke ytelsen på eldre enheter
- Ved lav ytelse, reduser antall spøkelser eller synsrekkevidde

## 📸 Screenshots

### Spillopplevelse på mobil

#### Startskjerm med kart
Når spillet starter, ser du kartet med din posisjon (blå prikk) og spilleområdet (grønn sirkel).

#### Under spillet
Røde spøkelser med lyskjegler beveger seg rundt i kartet. Du må unngå å komme i synlinjene deres.

#### Toppliste
Se de beste spillerne og deres overlevelsestid. Hvis du havner på topp 10, kan du legge inn navnet ditt!

#### Innstillingsmeny
Juster vanskelighetsgrad ved å endre antall spøkelser, deres hastighet, synsfelt og rekkevidde.

*Merk: For å se spillet i aksjon, åpne `index.html` i en nettleser med GPS-tilgang på en mobil enhet*

## 🎯 Fremtidige forbedringer

Potensielle utvidelser til spillet:
- Flerspiller-modus hvor andre spillere også dukker opp på kartet
- Powerups og spesialeffekter
- Forskjellige spillmodi (f.eks. "Capture the Flag")
- Achievements og statistikk
- Lyd og vibrasjoner for mer spennende opplevelse
- Støtte for flere kartleverandører

## 📝 Lisens

Dette er et hobbyprosjekt utviklet for underholdning og læring.

## 👨‍💻 Utvikler

Utviklet av [@alexanno](https://github.com/alexanno)

---

**Ha det gøy og løp for livet! 👻🏃‍♂️**
