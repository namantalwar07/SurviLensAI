export const EMERGENCY_SCENARIOS = {
    en: {
      cuts: {
        title: 'Cuts & Wounds',
        icon: '🩹',
        steps: [
          'Stop the bleeding: Apply direct pressure with a clean cloth',
          'Clean the wound: Rinse with clean water (avoid soap in wound)',
          'Apply antibiotic: Use antibiotic cream if available',
          'Bandage: Cover with sterile bandage or clean cloth',
          'Watch for infection: Redness, swelling, or pus means see a doctor',
        ],
      },
      burns: {
        title: 'Burns',
        icon: '🔥',
        steps: [
          'Cool the burn: Hold under cool (not cold) running water for 10-20 minutes',
          'Remove jewelry: Take off rings, watches before swelling starts',
          'Do NOT use ice: This can damage tissue further',
          'Cover loosely: Use sterile gauze or clean cloth',
          'Do NOT pop blisters: Keep them intact to prevent infection',
          'Seek help: See doctor for large burns or burns on face/hands',
        ],
      },
      choking: {
        title: 'Choking',
        icon: '🫁',
        steps: [
          'Ask: "Are you choking?" If they can cough, let them',
          'Stand behind person: Wrap arms around their waist',
          'Make a fist: Place above navel, below ribcage',
          'Heimlich maneuver: Quick upward thrusts 5 times',
          'Repeat: Continue until object comes out',
          'Call emergency: If person becomes unconscious',
        ],
      },
      fracture: {
        title: 'Fracture/Broken Bone',
        icon: '🦴',
        steps: [
          'Do NOT move the injured area',
          'Immobilize: Use splint or rolled newspaper to support',
          'Ice: Apply ice pack wrapped in cloth (20 min on, 20 min off)',
          'Elevate: Raise injured area above heart if possible',
          'Do NOT try to realign the bone',
          'Seek medical help immediately',
        ],
      },
      cpr: {
        title: 'CPR (Adults)',
        icon: '❤️',
        steps: [
          'Check responsiveness: Tap and shout "Are you okay?"',
          'Call emergency: 102 (India) or local emergency number',
          'Position: Lay person flat on firm surface',
          'Hand position: Center of chest, between nipples',
          'Compressions: Push hard and fast, 100-120 per minute',
          'Depth: At least 2 inches deep',
          'Continue: Until help arrives or person breathes',
        ],
      },
      snakebite: {
        title: 'Snake Bite',
        icon: '🐍',
        steps: [
          'Stay calm and still: Movement spreads venom',
          'Note snake appearance: For identification (but don\'t chase it)',
          'Remove jewelry: Before swelling starts',
          'Position: Keep bite below heart level',
          'Do NOT: Cut wound, suck venom, apply ice, or tourniquet',
          'Get to hospital immediately: Antivenom needed',
        ],
      },
    },
    hi: {
      cuts: {
        title: 'कटने और घाव',
        icon: '🩹',
        steps: [
          'खून बंद करें: साफ कपड़े से दबाव डालें',
          'घाव साफ करें: साफ पानी से धोएं',
          'एंटीबायोटिक लगाएं: अगर उपलब्ध हो',
          'पट्टी बांधें: साफ पट्टी से ढकें',
          'संक्रमण देखें: लालिमा, सूजन - तुरंत डॉक्टर से मिलें',
        ],
      },
      burns: {
        title: 'जलने पर',
        icon: '🔥',
        steps: [
          'ठंडा करें: 10-20 मिनट तक ठंडे पानी में रखें',
          'गहने हटाएं: सूजन से पहले अंगूठी आदि निकालें',
          'बर्फ न लगाएं: यह त्वचा को और नुकसान पहुंचा सकता है',
          'ढीली पट्टी: साफ कपड़े से ढकें',
          'छाले न फोड़ें: संक्रमण से बचाव के लिए',
          'डॉक्टर को दिखाएं: बड़े जलने पर तुरंत',
        ],
      },
      choking: {
        title: 'गला घुटना',
        icon: '🫁',
        steps: [
          'पूछें: "क्या आपका गला घुट रहा है?" खांसी आ रही हो तो खांसने दें',
          'पीछे खड़े हों: व्यक्ति की कमर के चारों ओर हाथ लपेटें',
          'मुट्ठी बनाएं: नाभि के ऊपर, पसली के नीचे रखें',
          'हेमलिक विधि: 5 बार तेजी से ऊपर की ओर दबाएं',
          'दोहराएं: जब तक वस्तु बाहर न आ जाए',
          'आपातकालीन कॉल: अगर बेहोश हो जाए',
        ],
      },
      fracture: {
        title: 'हड्डी टूटना',
        icon: '🦴',
        steps: [
          'हिलाएं नहीं: घायल हिस्से को न छुएं',
          'स्थिर करें: लकड़ी या रोल्ड अखबार से सहारा दें',
          'बर्फ लगाएं: कपड़े में लपेटकर (20 मिनट)',
          'ऊपर उठाएं: संभव हो तो दिल से ऊपर',
          'हड्डी सीधी करने की कोशिश न करें',
          'तुरंत अस्पताल जाएं',
        ],
      },
      cpr: {
        title: 'CPR (वयस्क)',
        icon: '❤️',
        steps: [
          'होश जांचें: थपथपाएं और पुकारें',
          'आपातकालीन कॉल: 102 या 108 डायल करें',
          'स्थिति: व्यक्ति को सख्त सतह पर लिटाएं',
          'हाथ की स्थिति: छाती के बीच में',
          'दबाव: तेज और गहरा, 100-120 प्रति मिनट',
          'गहराई: कम से कम 2 इंच गहरा',
          'जारी रखें: जब तक मदद न आए',
        ],
      },
      snakebite: {
        title: 'सांप का काटना',
        icon: '🐍',
        steps: [
          'शांत रहें और स्थिर रहें: हलचल से जहर फैलता है',
          'सांप की पहचान करें: (लेकिन पीछा न करें)',
          'गहने हटाएं: सूजन से पहले',
          'स्थिति: काटे गए हिस्से को दिल से नीचे रखें',
          'ये न करें: घाव काटना, जहर चूसना, बर्फ लगाना',
          'तुरंत अस्पताल जाएं: एंटीवेनम चाहिए',
        ],
      },
    },
  };
  
  export const EMERGENCY_CONTACTS = {
    india: {
      ambulance: '102',
      fire: '101',
      police: '100',
      disaster: '108',
    },
  };
  