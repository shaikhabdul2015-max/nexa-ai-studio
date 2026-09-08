import { LanguageCode } from "../types";

export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    home: string;
    chat: string;
    research: string;
    projects: string;
    agents: string;
    knowledge: string;
    documents: string;
    code: string;
    data: string;
    image: string;
    voice: string;
    history: string;
    settings: string;
  };
  home: {
    welcome: string;
    subtitle: string;
    searchPlaceholder: string;
    quickActions: string;
    recentChats: string;
    recentProjects: string;
    startNewChat: string;
    deepResearch: string;
    analyzeDocument: string;
    analyzeData: string;
    createImage: string;
    startCoding: string;
    createAgent: string;
  };
  chat: {
    newChat: string;
    inputPlaceholder: string;
    stopGeneration: string;
    regenerate: string;
    copy: string;
    copied: string;
    share: string;
    edit: string;
    delete: string;
    rename: string;
    pin: string;
    unpin: string;
    archive: string;
    reasoningMode: string;
    selectModel: string;
    attachFile: string;
    attachImage: string;
    voiceInput: string;
  };
  research: {
    title: string;
    subtitle: string;
    topicPlaceholder: string;
    generateReport: string;
    citations: string;
  };
  projects: {
    title: string;
    subtitle: string;
    newProject: string;
    searchPlaceholder: string;
  };
  agents: {
    title: string;
    subtitle: string;
    createAgent: string;
    searchPlaceholder: string;
  };
  knowledge: {
    title: string;
    subtitle: string;
    addDocument: string;
    searchPlaceholder: string;
  };
  documents: {
    title: string;
    subtitle: string;
    dropzone: string;
    summarize: string;
    askQuestion: string;
    extractTerms: string;
    extractTables: string;
    compareDocs: string;
    actionItems: string;
    translate: string;
  };
  code: {
    title: string;
    subtitle: string;
    explain: string;
    findBugs: string;
    refactor: string;
    generateTests: string;
    generateDocs: string;
    reviewArchitecture: string;
  };
  data: {
    title: string;
    subtitle: string;
  };
  image: {
    title: string;
    subtitle: string;
    promptPlaceholder: string;
  };
  voice: {
    title: string;
    subtitle: string;
    listening: string;
    speaking: string;
    thinking: string;
  };
  history: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
  };
  settings: {
    title: string;
    subtitle: string;
    general: string;
    aiConfig: string;
    memory: string;
    accountPlan: string;
    security: string;
    language: string;
    theme: string;
  };
  common: {
    cancel: string;
    save: string;
    close: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    delete: string;
    edit: string;
    download: string;
    export: string;
    language: string;
  };
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appName: "NEXA AI",
    tagline: "One AI. Infinite Possibilities.",
    nav: {
      home: "Home",
      chat: "AI Chat",
      research: "Deep Research",
      projects: "Projects",
      agents: "AI Agents",
      knowledge: "Knowledge Base",
      documents: "Documents",
      code: "Coding Lab",
      data: "Data Analyst",
      image: "Image Studio",
      voice: "Voice Mode",
      history: "History",
      settings: "Settings",
    },
    home: {
      welcome: "Welcome to NEXA AI",
      subtitle: "Next-generation multimodal intelligence for research, development, data, and synthesis.",
      searchPlaceholder: "Search conversations, projects, documents, or type / for commands...",
      quickActions: "Quick Actions",
      recentChats: "Recent Conversations",
      recentProjects: "Active Projects",
      startNewChat: "Start New Chat",
      deepResearch: "Deep Research",
      analyzeDocument: "Analyze Document",
      analyzeData: "Analyze Data",
      createImage: "Create Image",
      startCoding: "Start Coding",
      createAgent: "Create Agent",
    },
    chat: {
      newChat: "New Chat",
      inputPlaceholder: "Ask anything, write code, upload documents, or press microphone...",
      stopGeneration: "Stop",
      regenerate: "Regenerate",
      copy: "Copy",
      copied: "Copied!",
      share: "Share",
      edit: "Edit",
      delete: "Delete",
      rename: "Rename",
      pin: "Pin",
      unpin: "Unpin",
      archive: "Archive",
      reasoningMode: "Deep Reasoning",
      selectModel: "Select Model",
      attachFile: "Attach Document",
      attachImage: "Upload Image",
      voiceInput: "Voice Input",
    },
    research: {
      title: "Deep Research",
      subtitle: "Autonomous multi-source research agent with web grounding and factual citations.",
      topicPlaceholder: "Enter research topic, technology comparison, or investigative thesis...",
      generateReport: "Generate Research Dossier",
      citations: "Verifiable Citations",
    },
    projects: {
      title: "Projects",
      subtitle: "Organized workspaces with custom instructions, isolated contexts, and reference files.",
      newProject: "New Project",
      searchPlaceholder: "Filter projects by title or category...",
    },
    agents: {
      title: "AI Agents",
      subtitle: "Autonomous role-specialized personas with tailored prompts, tool permissions, and outputs.",
      createAgent: "Create Agent",
      searchPlaceholder: "Search agent roster by name or specialty...",
    },
    knowledge: {
      title: "Knowledge Base",
      subtitle: "Store guidelines, architectural manuals, and snippets for long-term assistant grounding.",
      addDocument: "Add Document",
      searchPlaceholder: "Search guidelines, references, and snippets...",
    },
    documents: {
      title: "Document AI",
      subtitle: "Multimodal document intelligence: summarize, compare, extract tables, and analyze clauses.",
      dropzone: "Drop documents here or click to browse",
      summarize: "Summarize Document",
      askQuestion: "Ask Questions About Document",
      extractTerms: "Extract Key Terms & Definitions",
      extractTables: "Extract Tables & Tabular Data",
      compareDocs: "Compare Two Documents",
      actionItems: "Generate Action Items",
      translate: "Translate Document",
    },
    code: {
      title: "Coding Lab",
      subtitle: "Advanced software engineering workbench: bugs, refactoring, unit tests, and live sandbox.",
      explain: "Explain Code",
      findBugs: "Find Bugs & Fixes",
      refactor: "Refactor Code",
      generateTests: "Generate Tests",
      generateDocs: "Generate Documentation",
      reviewArchitecture: "Architecture Review",
    },
    data: {
      title: "Data Analyst",
      subtitle: "Quantitative AI workspace: tabular anomaly detection, statistical summaries, and chart models.",
    },
    image: {
      title: "Image Studio",
      subtitle: "Generate high-resolution creative assets using Gemini 3 Pro with 1K, 2K, and 4K sizing.",
      promptPlaceholder: "Describe your concept with fine lighting, cinematic texture, and architectural details...",
    },
    voice: {
      title: "Voice Mode",
      subtitle: "Low-latency conversational speech synthesis with audio waveform visualizers.",
      listening: "Listening...",
      speaking: "Speaking...",
      thinking: "Thinking...",
    },
    history: {
      title: "Unified History",
      subtitle: "Audit trails, session exports, and searchable multi-turn transcripts.",
      searchPlaceholder: "Search across all transcripts and notes...",
    },
    settings: {
      title: "Settings & System Control",
      subtitle: "Configure localization, model parameters, memory preferences, and security permissions.",
      general: "General",
      aiConfig: "AI Configuration",
      memory: "Memory Management",
      accountPlan: "Plan & Usage",
      security: "Security & Privacy",
      language: "Language",
      theme: "Theme",
    },
    common: {
      cancel: "Cancel",
      save: "Save",
      close: "Close",
      search: "Search",
      loading: "Processing...",
      error: "An error occurred",
      success: "Operation successful",
      delete: "Delete",
      edit: "Edit",
      download: "Download",
      export: "Export",
      language: "Language",
    },
  },
  hi: {
    appName: "नेक्सा एआई (NEXA AI)",
    tagline: "एक एआई। अनंत संभावनाएं।",
    nav: {
      home: "होम",
      chat: "एआई चैट",
      research: "गहन शोध (Deep Research)",
      projects: "प्रोजेक्ट्स",
      agents: "एआई एजेंट्स",
      knowledge: "नॉलेज बेस",
      documents: "दस्तावेज़ (Documents)",
      code: "कोडिंग लैब",
      data: "डेटा विश्लेषक (Data Analyst)",
      image: "इमेज स्टूडियो",
      voice: "वॉइस मोड",
      history: "इतिहास",
      settings: "सेटिंग्स",
    },
    home: {
      welcome: "NEXA AI में आपका स्वागत है",
      subtitle: "शोध, विकास, डेटा विश्लेषण और रचनात्मकता के लिए अगली पीढ़ी की मल्टीमॉडल बुद्धिमत्ता।",
      searchPlaceholder: "बातचीत, प्रोजेक्ट, दस्तावेज़ खोजें या कमांड के लिए / टाइप करें...",
      quickActions: "त्वरित क्रियाएं",
      recentChats: "हालिया बातचीत",
      recentProjects: "सक्रिय प्रोजेक्ट्स",
      startNewChat: "नई चैट शुरू करें",
      deepResearch: "गहन शोध",
      analyzeDocument: "दस्तावेज़ का विश्लेषण",
      analyzeData: "डेटा विश्लेषण",
      createImage: "चित्र बनाएं",
      startCoding: "कोडिंग शुरू करें",
      createAgent: "एजेंट बनाएं",
    },
    chat: {
      newChat: "नई चैट",
      inputPlaceholder: "कुछ भी पूछें, कोड लिखें, फ़ाइलें अपलोड करें...",
      stopGeneration: "रोकें",
      regenerate: "पुनः उत्पन्न करें",
      copy: "कॉपी करें",
      copied: "कॉपी हो गया!",
      share: "साझा करें",
      edit: "संपादित करें",
      delete: "हटाएं",
      rename: "नाम बदलें",
      pin: "पिन करें",
      unpin: "अनपिन करें",
      archive: "संग्रहीत करें",
      reasoningMode: "गहन तर्क (Deep Reasoning)",
      selectModel: "मॉडल चुनें",
      attachFile: "फ़ाइल संलग्न करें",
      attachImage: "चित्र अपलोड करें",
      voiceInput: "वॉइस इनपुट",
    },
    research: {
      title: "गहन शोध (Deep Research)",
      subtitle: "वेब ग्राउंडिंग और सटीक स्रोतों के साथ स्वायत्त मल्टी-सोर्स अनुसंधान रिपोर्ट।",
      topicPlaceholder: "शोध का विषय, तकनीकी तुलना या थीसिस दर्ज करें...",
      generateReport: "शोध रिपोर्ट तैयार करें",
      citations: "सत्यापन योग्य स्रोत",
    },
    projects: {
      title: "प्रोजेक्ट्स (Projects)",
      subtitle: "विशिष्ट निर्देशों, संदर्भ फ़ाइलों और पृथक संदर्भ के साथ व्यवस्थित कार्यक्षेत्र।",
      newProject: "नया प्रोजेक्ट",
      searchPlaceholder: "शीर्षक या श्रेणी के आधार पर खोजें...",
    },
    agents: {
      title: "एआई एजेंट्स (AI Agents)",
      subtitle: "विशिष्ट भूमिकाओं, अनुकूलित प्रॉम्प्ट्स और उपकरणों से लैस स्वायत्त डिजिटल सहायक।",
      createAgent: "एजेंट बनाएं",
      searchPlaceholder: "नाम या विशेषता के आधार पर खोजें...",
    },
    knowledge: {
      title: "नॉलेज बेस (Knowledge Base)",
      subtitle: "निरंतर सहायक संदर्भ के लिए दिशानिर्देश, मैनुअल और कोड स्निपेट्स सुरक्षित रखें।",
      addDocument: "दस्तावेज़ जोड़ें",
      searchPlaceholder: "नॉलेज बेस में खोजें...",
    },
    documents: {
      title: "दस्तावेज़ एआई (Document AI)",
      subtitle: "दस्तावेज़ों का सारांश, तुलना, टेबल निष्कर्षण और खंड विश्लेषण।",
      dropzone: "फ़ाइलें यहाँ खींचें या अपलोड करने के लिए क्लिक करें",
      summarize: "दस्तावेज़ सारांश",
      askQuestion: "दस्तावेज़ से प्रश्न पूछें",
      extractTerms: "महत्वपूर्ण शब्द निकालें",
      extractTables: "तालिका डेटा निकालें",
      compareDocs: "दो दस्तावेज़ों की तुलना करें",
      actionItems: "कार्य सूची बनाएं",
      translate: "दस्तावेज़ का अनुवाद करें",
    },
    code: {
      title: "कोडिंग लैब (Coding Lab)",
      subtitle: "सॉफ़्टवेयर इंजीनियरिंग वर्कस्पेस: बग्स खोजें, रीफैक्टर करें, परीक्षण बनाएं।",
      explain: "कोड समझें",
      findBugs: "बग्स और सुधार खोजें",
      refactor: "कोड रीफैक्टर करें",
      generateTests: "यूनिट टेस्ट बनाएं",
      generateDocs: "दस्तावेज़ीकरण बनाएं",
      reviewArchitecture: "आर्किटेक्चर समीक्षा",
    },
    data: {
      title: "डेटा विश्लेषक (Data Analyst)",
      subtitle: "सांख्यिकीय अंतर्दृष्टि, विसंगति पहचान और चार्ट अनुशंसाएं।",
    },
    image: {
      title: "इमेज स्टूडियो (Image Studio)",
      subtitle: "Gemini 3 Pro के साथ 1K, 2K और 4K आकार में उच्च-रिज़ॉल्यूशन छवियां बनाएं।",
      promptPlaceholder: "अपनी कल्पना का विवरण दें...",
    },
    voice: {
      title: "वॉइस मोड (Voice Mode)",
      subtitle: "वास्तविक समय वॉयस इंटरेक्शन और वेवफॉर्म विज़ुअलाइज़र।",
      listening: "सुन रहे हैं...",
      speaking: "बोल रहे हैं...",
      thinking: "सोच रहे हैं...",
    },
    history: {
      title: "एकीकृत इतिहास (Unified History)",
      subtitle: "सभी बातचीत और सत्रों का सुरक्षित रिकॉर्ड।",
      searchPlaceholder: "इतिहास में खोजें...",
    },
    settings: {
      title: "सेटिंग्स (Settings)",
      subtitle: "भाषा, मॉडल पैरामीटर, मेमोरी और सुरक्षा प्राथमिकताएं।",
      general: "सामान्य",
      aiConfig: "एआई विन्यास",
      memory: "मेमोरी प्रबंधन",
      accountPlan: "योजना और उपयोग",
      security: "सुरक्षा और गोपनीयता",
      language: "भाषा",
      theme: "थीम",
    },
    common: {
      cancel: "रद्द करें",
      save: "सहेजें",
      close: "बंद करें",
      search: "खोजें",
      loading: "प्रक्रिया जारी है...",
      error: "त्रुटि हुई",
      success: "सफलतापूर्वक संपन्न",
      delete: "हटाएं",
      edit: "संपादित करें",
      download: "डाउनलोड",
      export: "निर्यात",
      language: "भाषा",
    },
  },
  mr: {
    appName: "नेक्सा एआय (NEXA AI)",
    tagline: "एक एआय. अनंत शक्यता.",
    nav: {
      home: "मुख्यपृष्ठ",
      chat: "एआय चॅट",
      research: "सखोल संशोधन (Deep Research)",
      projects: "प्रकल्प (Projects)",
      agents: "एआय एजंट्स",
      knowledge: "नॉलेज बेस",
      documents: "कागदपत्रे (Documents)",
      code: "कोडिंग लॅब",
      data: "डेटा विश्लेषक (Data Analyst)",
      image: "इमेज स्टुडिओ",
      voice: "व्हॉइस मोड",
      history: "इतिहास",
      settings: "सेटिंग्ज",
    },
    home: {
      welcome: "NEXA AI मध्ये आपले स्वागत आहे",
      subtitle: "संशोधन, कोडिंग, डेटा विश्लेषण आणि उत्पादकतेसाठी पुढील पिढीचे मल्टीमॉडल एआय.",
      searchPlaceholder: "संभाषणे, प्रकल्प, दस्तऐवज शोधा किंवा / टाइप करा...",
      quickActions: "द्रुत कृती",
      recentChats: "अलीकडील संभाषणे",
      recentProjects: "सक्रिय प्रकल्प",
      startNewChat: "नवीन चॅट सुरू करा",
      deepResearch: "सखोल संशोधन",
      analyzeDocument: "दस्तऐवज विश्लेषण",
      analyzeData: "डेटा विश्लेषण",
      createImage: "चित्र तयार करा",
      startCoding: "कोडिंग सुरू करा",
      createAgent: "एजंट तयार करा",
    },
    chat: {
      newChat: "नवीन चॅट",
      inputPlaceholder: "काहीही विचारा, कोड लिहा, फायली जोडा...",
      stopGeneration: "थांबवा",
      regenerate: "पुन्हा तयार करा",
      copy: "कॉपी करा",
      copied: "कॉपी झाले!",
      share: "शेअर करा",
      edit: "संपादित करा",
      delete: "हटवा",
      rename: "नाव बदला",
      pin: "पिन करा",
      unpin: "अनपिन करा",
      archive: "संग्रहित करा",
      reasoningMode: "सखोल तर्क (Deep Reasoning)",
      selectModel: "मॉडेल निवडा",
      attachFile: "फाइल जोडा",
      attachImage: "चित्र जोडा",
      voiceInput: "व्हॉइस इनपुट",
    },
    research: {
      title: "सखोल संशोधन (Deep Research)",
      subtitle: "वेब ग्राउंडिंग आणि विश्वसनीय स्रोतांसह स्वायत्त संशोधन अहवाल.",
      topicPlaceholder: "संशोधनाचा विषय किंवा तंत्रज्ञान तुलना प्रविष्ट करा...",
      generateReport: "संशोधन अहवाल तयार करा",
      citations: "सत्यापित स्रोत",
    },
    projects: {
      title: "प्रकल्प (Projects)",
      subtitle: "सानुकूल सूचना आणि फाइल्ससह संघटित कार्यक्षेत्र.",
      newProject: "नवीन प्रकल्प",
      searchPlaceholder: "शीर्षक किंवा श्रेणीनुसार शोधा...",
    },
    agents: {
      title: "एआय एजंट्स (AI Agents)",
      subtitle: "विशिष्ट भूमिका आणि उपकरणांसह सज्ज स्वायत्त डिजिटल सहाय्यक.",
      createAgent: "एजंट तयार करा",
      searchPlaceholder: "नाव किंवा वैशिष्ट्यानुसार शोधा...",
    },
    knowledge: {
      title: "नॉलेज बेस (Knowledge Base)",
      subtitle: "दीर्घकालीन संदर्भासाठी मार्गदर्शक तत्त्वे आणि कोड स्निपेट्स सुरक्षित ठेवा.",
      addDocument: "दस्तऐवज जोडा",
      searchPlaceholder: "नॉलेज बेसमध्ये शोधा...",
    },
    documents: {
      title: "दस्तऐवज एआय (Document AI)",
      subtitle: "दस्तऐवज सारांश, तुलना, सारणी निष्कर्षण आणि खंड विश्लेषण.",
      dropzone: "फायली येथे ड्रॅग करा किंवा निवडण्यासाठी क्लिक करा",
      summarize: "दस्तऐवज सारांश",
      askQuestion: "दस्तऐवजातून प्रश्न विचारा",
      extractTerms: "महत्त्वाचे शब्द काढा",
      extractTables: "सारणी डेटा काढा",
      compareDocs: "दोन दस्तऐवजांची तुलना करा",
      actionItems: "कृती सूची तयार करा",
      translate: "दस्तऐवज भाषांतरित करा",
    },
    code: {
      title: "कोडिंग लॅब (Coding Lab)",
      subtitle: "सॉफ्टवेअर अभियांत्रिकी कार्यक्षेत्र: बग शोधणे, रीफॅक्टरिंग, चाचण्या.",
      explain: "कोड समजावून सांगा",
      findBugs: "बग आणि उपाय शोधा",
      refactor: "कोड रीफॅक्टर करा",
      generateTests: "चाचण्या तयार करा",
      generateDocs: "दस्तऐवजीकरण तयार करा",
      reviewArchitecture: "आर्किटेक्चर पुनरावलोकन",
    },
    data: {
      title: "डेटा विश्लेषक (Data Analyst)",
      subtitle: "संख्याशास्त्रीय अंतर्दृष्टी, विसंगती ओळख आणि चार्ट शिफारसी.",
    },
    image: {
      title: "इमेज स्टुडिओ (Image Studio)",
      subtitle: "Gemini 3 Pro सह 1K, 2K आणि 4K आकारात उच्च-रिझोल्यूशन चित्रे तयार करा.",
      promptPlaceholder: "तुमच्या कल्पनेचे वर्णन करा...",
    },
    voice: {
      title: "व्हॉइस मोड (Voice Mode)",
      subtitle: "रिअल-टाइम व्हॉइस संवाद आणि ऑडिओ वेव्हफॉर्म व्हिज्युअलायझर.",
      listening: "ऐकत आहे...",
      speaking: "बोलत आहे...",
      thinking: "विचार करत आहे...",
    },
    history: {
      title: "एकत्रित इतिहास (Unified History)",
      subtitle: "सर्व संभाषणे आणि सत्रांची सुरक्षित नोंद.",
      searchPlaceholder: "इतिहासामध्ये शोधा...",
    },
    settings: {
      title: "सेटिंग्ज (Settings)",
      subtitle: "भाषा, मॉडेल पॅरामीटर्स, मेमरी आणि सुरक्षा प्राधान्ये.",
      general: "सामान्य",
      aiConfig: "एआय कॉन्फिगरेशन",
      memory: "मेमरी व्यवस्थापन",
      accountPlan: "प्लॅन आणि वापर",
      security: "सुरक्षा आणि गोपनीयता",
      language: "भाषा",
      theme: "थीम",
    },
    common: {
      cancel: "रद्द करा",
      save: "जतन करा",
      close: "बंद करा",
      search: "शोधा",
      loading: "प्रक्रिया सुरू आहे...",
      error: "त्रुटी आली",
      success: "यशस्वी",
      delete: "हटवा",
      edit: "संपादित करा",
      download: "डाउनलोड",
      export: "निर्यात करा",
      language: "भाषा",
    },
  },
};
