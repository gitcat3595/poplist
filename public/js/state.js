/* ══════════════════════════════════════════
   STATE — mirrors Firestore data model
══════════════════════════════════════════ */
const state = {
  bubbleStyle:    'luminous', // luminous | solid | ring | ink
  bubbleColour:   'bc-blue',  // bc-* class
  isProUser:      false,       // set true after Firebase auth confirms Pro; always true when no Firebase config
  greyBubbles:    false,       // FREE — greyscale mode
  lang:           'en',
  isListening:    false,
  userId:         null,        // Firebase UID when signed in, null for guest
  isLoggedIn:     false,
  carryOverCount: 0,           // tasks carrying over after Done for today
  defaultTiming:  'This Week',
  categories: [
    { id:'work',     en:'Work',     ja:'仕事',    keywords:['meeting','email','report','client','project','deadline','invoice','proposal','presentation','call','boss','budget'], customKeywords:[] },
    { id:'home',     en:'Home',     ja:'家の事',  keywords:['groceri','supermarket','clean','trash','laundry','repair','fix','bill','rent','cook','dinner','delivery'], customKeywords:[] },
    { id:'personal', en:'Personal', ja:'自分の事',keywords:['gym','run','jog','doctor','dentist','hospital','read','book','friend','family','travel','hobby','yoga','haircut'], customKeywords:[] },
    { id:'other',    en:'Other',    ja:'その他',  keywords:[], customKeywords:[] },
  ],
};
