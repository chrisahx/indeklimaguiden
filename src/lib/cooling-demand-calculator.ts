export type CoolingDemandPage = {
  key: string;
  path: string;
  title: string;
  description: string;
  breadcrumbName: string;
  pill: string;
  h1: string;
  intro: string;
  quickAnswer: string;
  answer: string;
  primaryHeading: string;
  primaryCopy: string[];
  exampleHeading: string;
  exampleCopy: string;
  adviceHeading: string;
  adviceCopy: string[];
  defaultValues: {
    area: number;
    height: number;
    insulation: 'poor' | 'average' | 'good';
    sun: 'low' | 'normal' | 'high';
    people: number;
    windows: 'small' | 'normal' | 'large';
    equipment: number;
    profile: 'generic' | 'bedroom' | 'office' | 'sunroom' | 'server' | 'shop';
  };
  checklist: string[];
  relatedRooms: Array<{ label: string; href: string }>;
  faq: Array<{ question: string; answer: string }>;
};

const relatedRooms = [
  { label: 'Soveværelse', href: '/beregnere/koelebehov-beregner-sovevaerelse/' },
  { label: 'Hjemmekontor', href: '/beregnere/koelebehov-beregner-hjemmekontor/' },
  { label: 'Udestue', href: '/beregnere/koelebehov-beregner-udestue/' },
  { label: 'Serverrum', href: '/beregnere/koelebehov-beregner-serverrum/' },
  { label: 'Butik', href: '/beregnere/koelebehov-beregner-butik/' },
];

export const coolingDemandPages = {
  generic: {
    key: 'generic',
    path: '/beregnere/koelebehov-beregner/',
    title: 'Kølebehov beregner til rum | Beregn kW og BTU/h',
    description:
      'Beregn kølebehov til soveværelse, kontor, stue, udestue, serverrum eller butik. Indtast m², sol, vinduer, personer og udstyr, og få et estimat i kW og BTU/h.',
    breadcrumbName: 'Kølebehov beregner',
    pill: 'Kølebehov beregner',
    h1: 'Kølebehov beregner til rum',
    intro:
      'Indtast rummets størrelse, solindfald, vinduer, personer og udstyr, og få et praktisk estimat på hvor stor kølekapacitet du bør kigge efter.',
    quickAnswer:
      'Mange almindelige rum ligger omkring 2-5 kW, men sol, store vinduer og elektronik kan flytte behovet markant. Brug beregneren som første pejlemærke før du vælger aircondition eller luft til luft-varmepumpe.',
    answer:
      'Kølebehov afhænger især af rumvolumen, solindfald, vinduesareal, isolering, personer og varme fra elektronik. En beregner giver et nyttigt første estimat i kW og BTU/h, men usædvanlige rum bør vurderes konkret.',
    primaryHeading: 'Hvordan beregner man kølebehov?',
    primaryCopy: [
      'En kølebehov beregner starter med rummets volumen og justerer derefter for de forhold, der typisk skaber varme i danske boliger og erhvervsrum: direkte sol, store glaspartier, mennesker og elektrisk udstyr.',
      'Derfor er m² alene sjældent nok. Et nordvendt soveværelse og en sydvendt udestue kan have helt forskelligt kølebehov, selv hvis de har samme areal.',
    ],
    exampleHeading: 'Eksempel på beregning af kølebehov',
    exampleCopy:
      'Et rum på 30 m² med 2,4 meter loftshøjde, normalt solindfald, to personer og almindelige vinduer vil ofte ende omkring 2,5-3,5 kW. Hvis rummet har meget sol eller store glaspartier, bør du regne med en højere kapacitet.',
    adviceHeading: 'Vælg den rigtige rumtype',
    adviceCopy: [
      'Brug den generiske beregner, hvis du vil have et hurtigt estimat. Hvis rummet er et soveværelse, hjemmekontor, udestue, serverrum eller butik, kan du bruge en af de målrettede beregnere med tekst og standardværdier til netop den rumtype.',
      'Læs også vores guides om aircondition og luft til luft-varmepumper, hvis du stadig sammenligner faste og mobile løsninger.',
    ],
    defaultValues: { area: 30, height: 2.4, insulation: 'average', sun: 'normal', people: 2, windows: 'normal', equipment: 150, profile: 'generic' },
    checklist: ['Rumstørrelse og loftshøjde', 'Solindfald og orientering', 'Vinduesareal og glaspartier', 'Antal personer', 'Varme fra elektronik og udstyr', 'Om rummet bruges om natten, om dagen eller hele døgnet'],
    relatedRooms,
    faq: [
      { question: 'Hvordan beregner jeg kølebehov i kW?', answer: 'Start med rummets m² og loftshøjde, og juster for sol, vinduer, isolering, personer og elektronik. Resultatet bør bruges som et vejledende estimat, ikke som endelig dimensionering.' },
      { question: 'Hvor mange kW aircondition skal jeg bruge?', answer: 'Mange rum kræver cirka 2-5 kW, men behovet afhænger af rumtype, solindfald, vinduer og varmebelastning. Store glaspartier og meget elektronik øger typisk behovet.' },
      { question: 'Hvad betyder BTU/h?', answer: 'BTU/h er en anden enhed for kølekapacitet. 1 kW svarer til cirka 3.412 BTU/h. Beregneren viser begge tal, så du kan sammenligne produkter.' },
      { question: 'Kan jeg bruge beregneren til varmepumpe med køling?', answer: 'Ja, hvis varmepumpen har kølefunktion. Resultatet viser vejledende kølekapacitet, men installation, placering og luftfordeling bør stadig vurderes konkret.' },
    ],
  },
  bedroom: {
    key: 'bedroom',
    path: '/beregnere/koelebehov-beregner-sovevaerelse/',
    title: 'Kølebehov beregner til soveværelse | Beregn kW til aircondition',
    description:
      'Beregn kølebehov til soveværelse ud fra m², loftshøjde, solindfald, vinduer og personer. Få estimat i kW og BTU/h til aircondition.',
    breadcrumbName: 'Kølebehov til soveværelse',
    pill: 'Soveværelse',
    h1: 'Kølebehov beregner til soveværelse',
    intro:
      'Beregn hvor meget køling et soveværelse typisk kræver, og få hjælp til at undgå både for lille kapacitet og unødigt støjende overdimensionering.',
    quickAnswer:
      'Et soveværelse kræver ofte mindre kapacitet end en stue, men sol om eftermiddagen, dårlig ventilation og store vinduer kan øge behovet. Støjniveau og natdrift er mindst lige så vigtige som kW.',
    answer:
      'Til soveværelser er kølebehovet ofte moderat, men komforten afhænger meget af støj, placering og om rummet når at blive opvarmet i løbet af dagen.',
    primaryHeading: 'Hvor stor aircondition til soveværelse?',
    primaryCopy: [
      'Når du beregner aircondition til soveværelse, bør du ikke kun se på m². Et lille rum med vestvendte vinduer kan blive meget varmt om aftenen, mens et nordvendt rum ofte kræver mindre køling.',
      'I soveværelser er en lidt mere stabil og støjsvag løsning ofte bedre end en meget kraftig model, der starter og stopper hårdt gennem natten.',
    ],
    exampleHeading: 'Eksempel: kølebehov i soveværelse',
    exampleCopy:
      'Et soveværelse på 16 m² med normal loftshøjde, to personer og almindeligt solindfald vil ofte ligge omkring 1,5-2,5 kW. Store vestvendte vinduer kan løfte behovet.',
    adviceHeading: 'Særligt for soveværelser',
    adviceCopy: [
      'Prioritér lavt støjniveau, nattilstand og korrekt placering af indedelen, så luften ikke blæser direkte på sengen.',
      'Hvis du bruger mobil aircondition, er aftræk og støj ofte de største begrænsninger i et soveværelse.',
    ],
    defaultValues: { area: 16, height: 2.4, insulation: 'average', sun: 'normal', people: 2, windows: 'normal', equipment: 40, profile: 'bedroom' },
    checklist: ['Lavt støjniveau om natten', 'Solindfald sidst på dagen', 'Placering i forhold til seng', 'Mulighed for mørklægning', 'Ventilation før sengetid', 'Om døren står åben eller lukket'],
    relatedRooms,
    faq: [
      { question: 'Hvor mange kW skal aircondition til soveværelse være?', answer: 'Mange soveværelser ligger omkring 1,5-2,5 kW, men solindfald, vinduer og isolering kan ændre behovet. Brug beregneren som første estimat.' },
      { question: 'Er en stor aircondition bedre i soveværelse?', answer: 'Ikke nødvendigvis. En for stor model kan give mere støj og ujævn komfort. Til soveværelser er lavt støjniveau og stabil drift ofte vigtigere.' },
      { question: 'Hvad påvirker kølebehov i soveværelse mest?', answer: 'Sol om eftermiddagen, vinduesstørrelse, isolering, antal personer og om rummet luftes ud før sengetid påvirker typisk behovet mest.' },
      { question: 'Kan en luft til luft-varmepumpe køle et soveværelse?', answer: 'Ja, hvis den har kølefunktion og er placeret korrekt. Vær især opmærksom på støjniveau, luftretning og om kapaciteten passer til rummets størrelse.' },
    ],
  },
  office: {
    key: 'office',
    path: '/beregnere/koelebehov-beregner-hjemmekontor/',
    title: 'Kølebehov beregner til hjemmekontor | Beregn aircondition kW',
    description:
      'Beregn kølebehov til hjemmekontor ud fra m², sol, vinduer, personer og elektronik. Få estimat i kW og BTU/h til aircondition.',
    breadcrumbName: 'Kølebehov til hjemmekontor',
    pill: 'Hjemmekontor',
    h1: 'Kølebehov beregner til hjemmekontor',
    intro:
      'Indtast rummets forhold og varme fra skærme, computer og andet udstyr, og se hvor meget køling et hjemmekontor typisk kræver.',
    quickAnswer:
      'Et hjemmekontor kan kræve mere køling end arealet antyder, fordi computer, skærme og opladere afgiver varme hele arbejdsdagen.',
    answer:
      'På et hjemmekontor bør kølebehov beregnes ud fra både rumstørrelse og udstyr. Elektronik kan give en mærkbar ekstra varmebelastning, især i små rum.',
    primaryHeading: 'Hvorfor bliver hjemmekontoret så varmt?',
    primaryCopy: [
      'Et hjemmekontor har ofte flere varmekilder end et almindeligt værelse: laptop eller stationær pc, eksterne skærme, dockingstation, printer, router og opladere.',
      'Hvis rummet samtidig har solindfald midt på dagen, kan temperaturen stige hurtigt, selv i et forholdsvis lille rum.',
    ],
    exampleHeading: 'Eksempel: kølebehov i hjemmekontor',
    exampleCopy:
      'Et hjemmekontor på 12 m² med én person, to skærme og cirka 250 watt udstyr kan ofte lande omkring 1,8-2,8 kW afhængigt af sol og vinduer.',
    adviceHeading: 'Særligt for hjemmekontor',
    adviceCopy: [
      'Indtast et realistisk watt-tal for dit udstyr. En laptop bruger ofte mindre end en stationær gaming- eller workstation-pc, men flere skærme kan stadig give mærkbar varme.',
      'Overvej også støj, fordi både aircondition og computerblæsere kan blive irriterende under møder.',
    ],
    defaultValues: { area: 12, height: 2.4, insulation: 'average', sun: 'normal', people: 1, windows: 'normal', equipment: 250, profile: 'office' },
    checklist: ['Computer og skærme i watt', 'Sol i arbejdstiden', 'Lukket dør eller åben plan', 'Støj under møder', 'Varme fra printer, router og opladere', 'Behov for stabil temperatur hele dagen'],
    relatedRooms,
    faq: [
      { question: 'Hvordan beregner jeg kølebehov til hjemmekontor?', answer: 'Beregn ud fra m², loftshøjde, sol, vinduer, personer og watt fra udstyr. Elektronik kan gøre et lille kontor varmere end forventet.' },
      { question: 'Hvor meget varme afgiver en computer?', answer: 'Det meste strømforbrug ender som varme i rummet. En opsætning på 250 watt tilfører derfor omtrent 250 watt varme, mens udstyret er i brug.' },
      { question: 'Er mobil aircondition god til hjemmekontor?', answer: 'Det kan fungere, hvis aftræk og støj er acceptable. Til fast daglig brug kan en installeret løsning ofte være mere støjsvag og effektiv.' },
      { question: 'Skal skærme og opladere tælles med?', answer: 'Ja, hvis de bruges i mange timer. Tæl især stationær pc, skærme, dockingstation, printer, router og andet udstyr, der står tændt i arbejdstiden.' },
    ],
  },
  sunroom: {
    key: 'sunroom',
    path: '/beregnere/koelebehov-beregner-udestue/',
    title: 'Kølebehov beregner til udestue | Beregn kW til køling',
    description:
      'Beregn kølebehov til udestue med store glaspartier, solindfald og varierende isolering. Få vejledende estimat i kW og BTU/h.',
    breadcrumbName: 'Kølebehov til udestue',
    pill: 'Udestue',
    h1: 'Kølebehov beregner til udestue',
    intro:
      'Udestuer er svære at dimensionere, fordi glas og sol kan give meget høj varmebelastning. Brug beregneren som et forsigtigt første estimat.',
    quickAnswer:
      'En udestue kræver ofte markant mere køling end et almindeligt rum på samme m², især ved syd- eller vestvendte glaspartier.',
    answer:
      'Kølebehov i udestuer styres især af glasareal, direkte sol og isolering. Beregneren kan give et estimat, men professionel vurdering er ekstra relevant her.',
    primaryHeading: 'Hvorfor kræver en udestue ekstra køling?',
    primaryCopy: [
      'Store glaspartier kan fungere som et drivhus, hvor solindfald hurtigt opvarmer både luft, gulv og møbler. Derfor kan en udestue kræve væsentligt mere kølekapacitet end en stue på samme størrelse.',
      'Afskærmning, udluftning og udvendig solfilm eller markise kan reducere behovet, men de ændrer ikke nødvendigvis behovet nok på de varmeste dage.',
    ],
    exampleHeading: 'Eksempel: kølebehov i udestue',
    exampleCopy:
      'En udestue på 20 m² med høj sol og store glaspartier kan nemt lande over 3 kW, og i svære tilfælde højere. Beregnerens resultat bør derfor ses som et startpunkt.',
    adviceHeading: 'Særligt for udestuer',
    adviceCopy: [
      'Vælg “højt solindfald” og “store vinduer”, hvis rummet har meget glas. Det giver et mere realistisk estimat end kun at regne på m².',
      'Hvis udestuen er dårligt isoleret eller bruges som helårsrum, bør dimensionering vurderes af en installatør.',
    ],
    defaultValues: { area: 20, height: 2.5, insulation: 'poor', sun: 'high', people: 2, windows: 'large', equipment: 50, profile: 'sunroom' },
    checklist: ['Mængden af glas', 'Syd- eller vestvendt sol', 'Udvendig solafskærmning', 'Isolering i tag og gulv', 'Om rummet er helårsrum', 'Mulighed for naturlig ventilation'],
    relatedRooms,
    faq: [
      { question: 'Hvor meget køling kræver en udestue?', answer: 'Ofte mere end et almindeligt rum på samme størrelse. Glas, sol og isolering betyder meget, og udestuer bør ofte vurderes konkret.' },
      { question: 'Kan aircondition køle en udestue?', answer: 'Ja, men kapacitet, placering og solafskærmning er afgørende. Store glaspartier kan gøre behovet højt på varme solrige dage.' },
      { question: 'Skal jeg vælge højt solindfald i beregneren?', answer: 'Ja, hvis udestuen får direkte sol i flere timer, især mod syd eller vest. Det giver et mere realistisk kølebehov.' },
      { question: 'Kan solafskærmning sænke kølebehovet?', answer: 'Ja. Udvendig afskærmning, markise eller solfilm kan reducere varmeindfaldet og dermed behovet for køling.' },
    ],
  },
  server: {
    key: 'server',
    path: '/beregnere/koelebehov-beregner-serverrum/',
    title: 'Kølebehov beregner til serverrum | Beregn kW til køling',
    description:
      'Beregn kølebehov til serverrum ud fra areal, personer og watt fra servere, netværk og UPS. Få estimat i kW og BTU/h.',
    breadcrumbName: 'Kølebehov til serverrum',
    pill: 'Serverrum',
    h1: 'Kølebehov beregner til serverrum',
    intro:
      'Indtast watt fra servere, netværksudstyr og UPS, og få et vejledende estimat på kølekapacitet til et lille serverrum eller teknikrum.',
    quickAnswer:
      'I serverrum kommer den største varmebelastning normalt fra udstyrets strømforbrug. 1.000 watt IT-udstyr bliver i praksis til cirka 1 kW varme, som skal fjernes kontinuerligt.',
    answer:
      'Til serverrum er udstyrets watt-forbrug ofte vigtigere end m². Beregneren kan give et hurtigt estimat, men kritisk drift bør dimensioneres professionelt med redundans.',
    primaryHeading: 'Sådan beregnes kølebehov i serverrum',
    primaryCopy: [
      'Næsten al strøm, der bruges af servere, switches, NAS, UPS og andet udstyr, ender som varme i rummet. Derfor bør du indtaste et realistisk samlet watt-tal for udstyret.',
      'Serverrum adskiller sig fra almindelige rum, fordi belastningen ofte er konstant hele døgnet. Det stiller større krav til stabil drift, alarmer og eventuel backup-køling.',
    ],
    exampleHeading: 'Eksempel: kølebehov i serverrum',
    exampleCopy:
      'Et lille teknikrum med 1.200 watt IT-udstyr, begrænset sol og få personer kan kræve omkring 1,8-2,8 kW kølekapacitet afhængigt af ventilation og sikkerhedsmargin.',
    adviceHeading: 'Særligt for serverrum',
    adviceCopy: [
      'Brug udstyrets faktiske eller maksimale watt-forbrug, ikke kun rummets størrelse. Find tallet på datablad, strømforsyning, UPS-overvågning eller en energimåler.',
      'Hvis rummet understøtter kritisk drift, bør beregneren kun bruges som indledende screening. Få en fagperson til at vurdere redundans, luftflow og alarmgrænser.',
    ],
    defaultValues: { area: 10, height: 2.4, insulation: 'average', sun: 'low', people: 0, windows: 'small', equipment: 1200, profile: 'server' },
    checklist: ['Samlet watt fra IT-udstyr', 'UPS og netværksudstyr', 'Kontinuerlig 24/7-belastning', 'Redundans og alarmbehov', 'Luftflow omkring racks', 'Varme fra tilstødende rum'],
    relatedRooms,
    faq: [
      { question: 'Hvordan beregner jeg køling til serverrum?', answer: 'Start med samlet watt fra IT-udstyr, fordi strømforbruget bliver til varme. Læg derefter rum, sol og sikkerhedsmargin oveni.' },
      { question: 'Hvor meget varme afgiver 1.000 watt serverudstyr?', answer: 'Cirka 1 kW varme. Næsten al strøm, som servere og netværksudstyr bruger, ender som varme i serverrummet.' },
      { question: 'Kan almindelig aircondition bruges til serverrum?', answer: 'Det afhænger af driftens kritikalitet. Små teknikrum kan nogle gange køles enkelt, men kritisk 24/7-drift kræver professionel dimensionering.' },
      { question: 'Skal serverrum have ekstra sikkerhedsmargin?', answer: 'Ofte ja. Der bør tages højde for udvidelser, varme dage, filtertilstopning, fejl og eventuel redundant køling.' },
    ],
  },
  shop: {
    key: 'shop',
    path: '/beregnere/koelebehov-beregner-butik/',
    title: 'Kølebehov beregner til butik | Beregn aircondition kW',
    description:
      'Beregn kølebehov til butik ud fra m², sol, glasfacade, kunder, personale og udstyr. Få estimat i kW og BTU/h.',
    breadcrumbName: 'Kølebehov til butik',
    pill: 'Butik',
    h1: 'Kølebehov beregner til butik',
    intro:
      'Beregn vejledende kølekapacitet til butikslokaler med kunder, glasfacade, belysning og udstyr, der afgiver varme gennem åbningstiden.',
    quickAnswer:
      'Butikker kan have højere kølebehov end boligrum, fordi kunder, personale, belysning, udstyr og glasfacader ofte belaster rummet samtidigt.',
    answer:
      'Kølebehov i butik afhænger af areal, glasfacade, antal personer, belysning, udstyr og hvor ofte døren åbnes. Beregneren giver et praktisk estimat til den tidlige vurdering.',
    primaryHeading: 'Hvad påvirker kølebehov i en butik?',
    primaryCopy: [
      'I en butik er varmebelastningen sjældent konstant. Den ændrer sig med kundetrafik, åbningstider, sol på facade, belysning og udstyr som kasse, skærme, kølemontre eller kaffemaskine.',
      'Derfor bør du indtaste et realistisk antal personer og watt fra udstyr, ikke kun butikkens m².',
    ],
    exampleHeading: 'Eksempel: kølebehov i butik',
    exampleCopy:
      'En mindre butik på 45 m² med glasfacade, tre personer og 800 watt udstyr kan ofte ende omkring 4-6 kW afhængigt af sol og ventilation.',
    adviceHeading: 'Særligt for butikker',
    adviceCopy: [
      'Butikker bør dimensioneres efter de varmeste og travleste perioder, ikke kun gennemsnittet. Overvej også lufttæppe, døråbninger og om kunder står tæt i perioder.',
      'Hvis løsningen påvirker kunder og personale hele dagen, bør støj, luftfordeling og serviceadgang vægtes højt.',
    ],
    defaultValues: { area: 45, height: 2.8, insulation: 'average', sun: 'normal', people: 4, windows: 'large', equipment: 800, profile: 'shop' },
    checklist: ['Glasfacade og direkte sol', 'Kunder og personale', 'Belysning og skærme', 'Kasse, kølemontre og andet udstyr', 'Døråbninger og ventilation', 'Støj og luftfordeling for kunder'],
    relatedRooms,
    faq: [
      { question: 'Hvordan beregner jeg kølebehov til butik?', answer: 'Regn med areal, loftshøjde, glasfacade, sol, personer og watt fra udstyr. Butikker kræver ofte mere end almindelige boligrum.' },
      { question: 'Hvorfor har butikker højt kølebehov?', answer: 'Kunder, personale, belysning, skærme, udstyr og glasfacader kan tilføre varme samtidigt, især i åbningstiden.' },
      { question: 'Skal kundetrafik tælles med?', answer: 'Ja. Personer afgiver varme, og mange kunder i korte perioder kan løfte behovet for køling og luftfordeling.' },
      { question: 'Er beregneren nok til erhvervsinstallation?', answer: 'Nej, den er et første estimat. Butikker bør normalt vurderes konkret, især ved store glasfacader, mange kunder eller krav til driftssikkerhed.' },
    ],
  },
} satisfies Record<string, CoolingDemandPage>;
