/**
 * UIU Faculty Photo Scraper
 * ─────────────────────────────────────────────────────────────
 * UIU website থেকে প্রতিটি faculty এর profile page visit করে
 * photo URL collect করে database এ update করে।
 *
 * চালানোর আগে:
 *   npm install axios cheerio
 *   (অথবা যদি আগেই installed থাকে, সরাসরি run করো)
 *
 * Run:
 *   npx ts-node --compiler-options {"module":"CommonJS"} prisma/scrape_photos.ts
 * ─────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// প্রতিটি faculty এর UIU profile URL mapping
// email → profile_url
// ─────────────────────────────────────────────
const facultyProfileUrls: Record<string, string> = {
  // ── CSE ──────────────────────────────────────────────
  "kashem@uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/abul-kashem",
  "hsarwar@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/hsarwar",
  "mnh@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/mnh",
  "mamun@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/mamun",
  "muzahid@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/muzahid",
  "motaharul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/motaharul",
  "sakib@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/pathan-al-sakib-khan",
  "kabir@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/kabir-muhammad-nomani",
  "shohrab@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/md-shohrab-hossain",
  "dewanfarid@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/dewanfarid",
  "mshahriar@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rahman-mohammad-shahriar",
  "suman@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/suman",
  "jannatun@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/dr-jannatun-noor-mukta",
  "ohidujjaman@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/ohidujjaman",
  "saddam@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/md-saddam-hossain-mukta",
  "riasat@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/azim-riasat",
  "aurna@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/nahid-ferdous-aurna",
  "mmelahi@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/mmelahi",
  "rubaiya@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rubaiya",
  "benzir@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/benzir",
  "nahid@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/hossain-nahid",
  "sadia@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/sadia",
  "moynuddin@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/shibly",
  "anika@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/anika",
  "khushnur@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/khushnur",
  "shoib@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/shoib",
  "fahimhafiz@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/hafiz-fahim",
  "tarek@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/tarek",
  "rayhan@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/md-rayhan-ahmed",
  "mahdee@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/abu-shafin-mohammad-mahdee-jameel",
  "nusrat@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/tithi",
  "minhajul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/minhajul",
  "nabila@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/nabila",
  "himu@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/himu",
  "romizul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/islam-md-romizul",
  "samin@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/somik-samin-sharaf",
  "iftekharul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/abedeen-iftekharul",
  "abdunnoor@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/noor-kazi-abdun",
  "muhyminul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/haque-md-muhyminul",
  "shadman@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/aadeeb",
  "umama@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rahman-umama",
  "charles@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/gomes-charles-aunkan",
  "shafqat@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/talukder-md-shafqat",
  "asif@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/utsa-asif-ahmed",
  "tanvir@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/raihan-md-tanvir",
  "sidratul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/muntaha-sidratul",
  "taki@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/yashir-taki",
  "abid@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/hossain-md-abid",
  "tanvin@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/tanvin-asnuva",
  "mosaddeque@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/tahmid-mosaddeque",
  "sanjida@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/tasmin-sanjida",
  "azizur@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/azizur-rahman-anik",
  "osama@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/a-h-m-osama-haque",
  "rahat@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/khandokar-md-rahat-hossain",
  "aditya@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/noman-asif-aditya",
  "mushfiqul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/md-mushfiqul-haque-omi",
  "tanmoy@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/tanmoy-bipro-das",
  "humaira@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/humaira-anzum-neha",
  "fahmin@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/m-fahmin-rahman",
  "saifur@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/shekh-md-saifur-rahman",
  "shihab@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/shihab-ahmed",
  "tanzila@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/sidratul-tanzila-tasmi",
  "sherajul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/sherajul-arifin",
  "mobaswirul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/mobaswirul-islam",
  "ibnemasud@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/abdullah-ibne-masud-mahi",
  "mahmudul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/mahmudul-hasan",
  "anwarul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/muhammad-anwarul-azim",
  "sajidahmed@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/sajid-ahmed-chowdhury",
  "sabah@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/sabah-ahmed",
  "rakib@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rakib-ahsan",
  "rakibulhasan@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rakibul-hasan-rafi",
  "muhaiminul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/muhaiminul-islam-nafi",
  "imran@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/imran-hossain",
  "fairoz@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/fairoz-anika",
  "didarul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/didarul-islam-didar",
  "tasmia@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/tasmia-binte-sogir",
  "tahsin@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/tahsin-wahid",
  "pranta@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/pranta-biswas",
  "rizvan@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rizvan-jawad-ruhan",
  "anudwaipaon@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/anudwaipaon-antu",
  "arnab@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/arnab-bhattacharjee",
  "rafid@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rafid-nahiyan-farabi",
  "shahriarmahmud@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/shahriar-mahmud",
  "manifa@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/nusaiba-zaman-manifa",
  "sayem@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/sayem-shahad",
  "hafijul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/hafijul-hoque-chowdhury",
  "abrar@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/abrar-mahmud",
  "asifabrar@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/asif-abrar",
  "sajjad@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/md-sajjad-hossain",
  "zunaid@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/md-zunaid-ul-alam",
  "siana@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/siana-rizwan",
  "siam@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/md-siam",
  "paran@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/ashraful-islam-paran",
  "nahin@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/nahin-f-siddiqui",
  "anindya@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/anindya-hoque",
  "zarif@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/syed-abu-ammar-muhammad-zarif",
  "saqif@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/saqif-kaisar",
  "sadaf@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/syed-samin-sadaf",
  "adilina@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/sheikh-adilina",
  "mahmud@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/khan-irtesam-mahmud",
  "sakibur@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/md-sakibur-rahman-sajal",
  "ashzavin@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/ashratuz-zavin-asha",
  "rifatbinrashid@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rashid-rifat-bin",
  "hasan@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/md-hasan-al-kayem",
  "jahidul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/emon-jahidul-hoq",
  "shanto@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/shanto-subangkar-karmaker",
  "ashiqurrahman@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rahman-md-ashiqur",
  "raiyan@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rahman-raiyan",
  "mohaiminul@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/islam-md-mohaiminul",
  "jobair@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/jobair-abdullah-al",
  "fahmid@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/rifat-fahmid-al",
  "tauseef@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/tajwar-sk-md-tauseef",
  "tamzid@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/hossain-md-tamzid",
  "tapotosh@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/tapotosh-ghosh",
  "anik@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/md-saidul-hoque-anik",
  "fahim@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/fahim-anzum",
  "tahmid@cse.uiu.ac.bd": "https://cse.uiu.ac.bd/faculty/akhand-md-nafis-tahmid",

  // ── EEE ──────────────────────────────────────────────
  "rezwanm@uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/rezwanm",
  "fayyaz@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/md-fayyaz-khan",
  "lutfulkabir@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/siddique-md-lutful-kabir",
  "rmostafa@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/rmostafa",
  "intekhab@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/intekhab",
  "masuk@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/masuk",
  "iqbal@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/iqbal",
  "sadidmuneer@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/muneer-sadid",
  "hasanuzzaman@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/md-hasanuzzaman",
  "shahriar@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/shahriar",
  "mizan@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/bkm",
  "helena@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/helena",
  "nurealam@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/md-nure-alam-dipu",
  "abrar@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/kazi-abrar-mahmud",
  "akif@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/akif-hamid",
  "moktacim@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/syed-moktacim-billah",
  "mostaqul@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/md-mostaqul-islam",
  "liakat@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/liakat-omar-rihan",
  "khawza@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/khawza-iftekhar-uddin-ahmed",
  "erahman@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/gma-ehsan-ur-rahman",
  "zubair@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/zubair",
  "raiyan@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/basher-raiyan",
  "haiderali@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/shuvo-s-m-haider-ali",
  "monzurul@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/chowdhury-s-m-monzurul-hoque",
  "mehenaz@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/afrin-mehenaz",
  "tasnia@eee.uiu.ac.bd": "https://eee.uiu.ac.bd/faculty/tasnia-tanjim-mim",

  // ── Civil Engineering ─────────────────────────────────
  "mujibur@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/rahman-md-mujibur",
  "rumana@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/afrin-rumana",
  "saiful@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/dr-md-saiful-islam",
  "nafisa@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/nafisa",
  "jamil@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/jamil-ahmed-joy",
  "tasfiqur@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/tasfiqur-rohman-ananta",
  "shahriare@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/shahriare-mahmud-sakib",
  "jannatul@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/jannatul-ferdows-nowrin",
  "shishir@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/shishir-shahriar-arif",
  "safayet@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/md-hossain-safayet",
  "ahnaf@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/ahnaf-rafi-sharan",
  "abdullah.ptfaculty@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/dr-abdullah-al-muyeed",
  "farzana@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/rahman-farzana-phd",
  "asif@ce.uiu.ac.bd": "https://ce.uiu.ac.bd/faculty/asif",

  // ── SoBE (Business) ──────────────────────────────────
  "niaz@eco.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/m-niaz-asadullah",
  "mmusa@uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mmusa",
  "salma@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/ska",
  "sohel@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/sohel",
  "raihan.joarder@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/joarder",
  "mohanuddin@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mohanuddin",
  "kawsar@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/kawsar-ahmmed",
  "khandoker@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mahmud_edu",
  "shariful@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/shariful",
  "jmssarkar@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/jmssarkar",
  "qamruzzaman@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/qamruzzaman",
  "seyama@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/sultana-seyama",
  "gouranga@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/debnath-dr-gouranga-chandra",
  "saadhasan@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/saad-hasan",
  "tariq@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/tariq",
  "rafij@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/rafij",
  "masum@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/masum",
  "kaium@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/kaium-hossain",
  "shakila@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/shakila-aziz",
  "rashed@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/dr-abu-zafar-md-rashed-osman",
  "mirza@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/dr-mirza-mohammad-didarul-alam",
  "shamsul@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/dr-mohammad-shamsul-alam-wasimi",
  "mbjalil@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mbj",
  "mosabbir@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mosabbir-uddin-ahmad",
  "enamul@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/muhammad-enamul-haque",
  "shayla@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/shayla",
  "ishrat@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/ishrat-sultana",
  "mimnun@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mimnun-sultana",
  "mamun@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mamun",
  "nasrin@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/nasrin-akter",
  "zinnatun@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/zinnatun-nesa",
  "tohid@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/tohid",
  "ishrat_jahan@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/jahan-ishrat",
  "kazimul@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/kazimul",
  "jakowan@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/jakowan",
  "ahmedimran@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/kabir-ahmed-imran",
  "farzana@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/farzana",
  "rana@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/rana-mazumder",
  "ziaul@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/ziaul-karim",
  "eliza@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/eliza-huq",
  "lamiaalam@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/lamia-alam",
  "mahossain@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mahossain",
  "piana@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/piana-monsur-mindia",
  "jerin@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/jerin-haque-chhanda",
  "imtiazzahan@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/imtiaz-zahan-chowdhury",
  "israt@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/israt-jabin",
  "rukaiya@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/rukaiya-rob",
  "mahbuba@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mahbuba-sultana",
  "nafisa@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/nafisa-rahman",
  "montaha@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/montaha-ayub-vasha",
  "nazmul-sobe@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/nazmul-huda-mohd-sharif-uddin",
  "abdullahfahad@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/abdullah-al-fahad",
  "msislam@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/muhammad-shahidul-islam",
  "sadia-sobe@bus.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/sadia-binte-anwar",

  // ── Economics ─────────────────────────────────────────
  "farooq@eco.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/farooq-mohammad-omar",
  "mashraf@eco.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mohammad-a-ashraf",
  "akhtaruzzaman@eco.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/dr-mohammad-akhtaruzzaman",
  "akhtar@eco.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/mohammad-akhtar-hossain",
  "shabnam@eco.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/shuchi-musharrat-shabnam",
  "tanseer@eco.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/ahamed-tanseer",
  "tanzila@eco.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/amir-tanzila",
  "tabassum@eco.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/tabassum",
  "tumpa@eco.uiu.ac.bd": "https://sobe.uiu.ac.bd/faculty/tumpa-tasneem-jahan",
  "srahman@hum.buet.ac.bd": "https://sobe.uiu.ac.bd/faculty/syed-mahbub-rahman",

  // ── INS (Natural Sciences) ────────────────────────────
  "saklayen@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/mssphy",
  "ahanupama@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/azhari-dr-hasin-anupama",
  "mamun@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/mamun-dr-abdullah-al",
  "mahtab@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/mahtab-uddin",
  "jsaha@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/jashodhan-saha",
  "mahboob@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/mahboob",
  "sagar@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/sagar-dutta",
  "asad@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/asad",
  "adnan@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/adnan",
  "nasrina@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/nasrina-parvin",
  "ashek@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/ahmed",
  "gourab@ins.uiu.ac.bd": "https://ins.uiu.ac.bd/faculty/gourab-kumar-roy",

  // ── English ───────────────────────────────────────────
  "kamrul@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/hasan",
  "shurovi@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/marzia-shurovi",
  "saimahasin@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/sahn",
  "nousin@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/nousin-laila-bristi",
  "sharif@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/chowdhury-omar-sharif",
  "gudgeon@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/ms-kirsten-gudgeon",
  "sadia@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/afrin-sadia",
  "habiba@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/umme-habiba",
  "labib@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/labib-rashid-inan",
  "muntasir@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/muntasir-ahmad",
  "abdullah@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/ahmed-abdullah-bin-farooqi-rayhan",
  "tashrifa@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/tashrifa-fairuz",
  "didar@eli.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/md-didar-hossain",
  "dil@eli.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/dil-nusrat",
  "saima@english.uiu.ac.bd": "https://english.uiu.ac.bd/faculty/saima-akter",

  // ── EDS ───────────────────────────────────────────────
  "hamidulhuq@eds.uiu.ac.bd": "https://eds.uiu.ac.bd/faculty/hhq",
  "mukul@eds.uiu.ac.bd": "https://eds.uiu.ac.bd/faculty/mukul-sharif-ahmed",
  "shantanu@eds.uiu.ac.bd": "https://eds.uiu.ac.bd/faculty/shantanu-kumar-saha",
  "naima@eds.uiu.ac.bd": "https://eds.uiu.ac.bd/faculty/naima-ansar-khan",
  "tirtho@eds.uiu.ac.bd": "https://eds.uiu.ac.bd/faculty/oliver-tirtho-sarkar",
  "taniah@eds.uiu.ac.bd": "https://eds.uiu.ac.bd/faculty/taniah-mahmuda-tinni",
  "jemima@eds.uiu.ac.bd": "https://eds.uiu.ac.bd/faculty/jemima-jahan-meem",
  "mallika@eds.uiu.ac.bd": "https://eds.uiu.ac.bd/faculty/mallika-datta",
  "sabrina@eds.uiu.ac.bd": "https://eds.uiu.ac.bd/faculty/sabrina-islam",
  "mizanur@eds.uiu.ac.bd": "https://eds.uiu.ac.bd/faculty/md-mizanur-rahman",

  // ── MSJ ───────────────────────────────────────────────
  "shafiul@msj.uiu.ac.bd": "https://msj.uiu.ac.bd/faculty/sheikh-mohammad-shafiul-islam",
  "hirstein@msj.uiu.ac.bd": "https://msj.uiu.ac.bd/faculty/mario-hirstein",
  "tania@msj.uiu.ac.bd": "https://msj.uiu.ac.bd/faculty/kazi-kamrun-nahar-tania",
  "sumia@msj.uiu.ac.bd": "https://msj.uiu.ac.bd/faculty/ms-sumia-zahid",
  "ammara@msj.uiu.ac.bd": "https://msj.uiu.ac.bd/faculty/ms-umme-ammara",

  // ── Pharmacy ──────────────────────────────────────────
  "mazid@pharmacy.uiu.ac.bd": "https://pharmacy.uiu.ac.bd/faculty/md-abdul-mazid",
  "tahmina@pharmacy.uiu.ac.bd": "https://pharmacy.uiu.ac.bd/faculty/foyez-tahmina",
  "masudur@pharmacy.uiu.ac.bd": "https://pharmacy.uiu.ac.bd/faculty/syed-masudur-rahman-dewan",
  "refaya@pharmacy.uiu.ac.bd": "https://pharmacy.uiu.ac.bd/faculty/refaya-rezwan",
  "sharmin@pharmacy.uiu.ac.bd": "https://pharmacy.uiu.ac.bd/faculty/rakhi-sharmin-ahmed",
  "sabiha@pharmacy.uiu.ac.bd": "https://pharmacy.uiu.ac.bd/faculty/tasnim-sabiha",
  "rifat@pharmacy.uiu.ac.bd": "https://pharmacy.uiu.ac.bd/faculty/rafe-salman-rifat",
  "ferdous@pharmacy.uiu.ac.bd": "https://pharmacy.uiu.ac.bd/faculty/mr-ferdous-ul-haque-joy",
  "rajibdas@pharmacy.uiu.ac.bd": "https://pharmacy.uiu.ac.bd/faculty/rajib-das",
  "nowsad@pharmacy.uiu.ac.bd": "https://pharmacy.uiu.ac.bd/faculty/nowsad-zahan-sathi",

  // ── BGE ───────────────────────────────────────────────
  "rafiqul@bge.uiu.ac.bd": "https://bge.uiu.ac.bd/faculty/s-m-rafiqul-islam",
  "belal@bge.uiu.ac.bd": "https://bge.uiu.ac.bd/faculty/md-belal-hussain-ripon",
  "shahriar@bge.uiu.ac.bd": "https://bge.uiu.ac.bd/faculty/khalid-shahriar",
  "zahin@bge.uiu.ac.bd": "https://bge.uiu.ac.bd/faculty/md-zahin-alam",
  "sibgatullah@bge.uiu.ac.bd": "https://bge.uiu.ac.bd/faculty/muhammad-sibgatullah-zunnun",
  "tamanna@bge.uiu.ac.bd": "https://bge.uiu.ac.bd/faculty/nahid-tamanna",
};

// Default image URL (photo না থাকলে এটা ব্যবহার হবে)
const DEFAULT_PHOTO = "https://cse.uiu.ac.bd/wp-content/uploads/sites/3/2023/11/default_image_uiu.jpg";

// ─────────────────────────────────────────────
// একটা faculty profile page থেকে photo URL বের করা
// ─────────────────────────────────────────────
async function scrapePhotoUrl(profileUrl: string): Promise<string> {
  try {
    const response = await axios.get(profileUrl, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // Faculty photo সাধারণত main content area তে প্রথম img tag হয়
    // এবং wp-content/uploads path এ থাকে
    let photoUrl = "";

    // Method 1: entry-content বা main content এর মধ্যে img খোঁজা
    $(".entry-content img, .faculty-profile img, main img, article img, .post-content img").each((_, el) => {
      const src = $(el).attr("src") || "";
      // Logo বা icon বাদ দিয়ে actual photo URL নেওয়া
      if (
        src.includes("wp-content/uploads") &&
        !src.includes("logo") &&
        !src.includes("icon") &&
        !src.includes("footer") &&
        !src.includes("facebook") &&
        !src.includes("twitter") &&
        !src.includes("youtube") &&
        photoUrl === ""
      ) {
        photoUrl = src;
      }
    });

    // Method 2: og:image meta tag থেকে (সব site এ available)
    if (!photoUrl) {
      const ogImage = $('meta[property="og:image"]').attr("content") || "";
      if (ogImage && !ogImage.includes("default_image") && ogImage.includes("wp-content/uploads")) {
        photoUrl = ogImage;
      }
    }

    // Method 3: যেকোনো img যেটা uploads এ আছে
    if (!photoUrl) {
      $("img").each((_, el) => {
        const src = $(el).attr("src") || "";
        if (
          src.includes("wp-content/uploads") &&
          !src.includes("logo") &&
          !src.includes("icon") &&
          !src.includes("background") &&
          photoUrl === ""
        ) {
          photoUrl = src;
        }
      });
    }

    return photoUrl || DEFAULT_PHOTO;
  } catch (error) {
    console.error(`   ⚠️  Error fetching ${profileUrl}:`, (error as Error).message);
    return DEFAULT_PHOTO;
  }
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────
async function main() {
  console.log("📸 UIU Faculty Photo Scraping শুরু হচ্ছে...\n");

  // Database থেকে সব faculty নিয়ে আসা
  const allFaculty = await prisma.faculty.findMany({
    select: { id: true, name: true, email: true },
  });

  console.log(`📋 মোট ${allFaculty.length} জন faculty পাওয়া গেছে।\n`);

  let successCount = 0;
  let defaultCount = 0;
  let skipCount = 0;

  for (let i = 0; i < allFaculty.length; i++) {
    const faculty = allFaculty[i];
    const profileUrl = facultyProfileUrls[faculty.email ?? ""];

    if (!profileUrl) {
      console.log(`[${i + 1}/${allFaculty.length}] ⏭️  Skip: ${faculty.name} (profile URL নেই)`);
      skipCount++;
      continue;
    }

    console.log(`[${i + 1}/${allFaculty.length}] 🔍 Scraping: ${faculty.name}`);

    const photoUrl = await scrapePhotoUrl(profileUrl);
    const isDefault = photoUrl === DEFAULT_PHOTO;

    // Database update করা
    await prisma.faculty.update({
      where: { id: faculty.id },
      data: { image: photoUrl },
    });

    if (isDefault) {
      console.log(`   📷 Default photo ব্যবহার করা হয়েছে`);
      defaultCount++;
    } else {
      console.log(`   ✅ Photo পাওয়া গেছে: ${photoUrl.split("/").pop()}`);
      successCount++;
    }

    // Rate limiting — server কে চাপ না দেওয়ার জন্য
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  console.log("\n═══════════════════════════════════════");
  console.log("🎉 Photo Scraping সম্পন্ন!");
  console.log(`✅ সফলভাবে photo পাওয়া গেছে: ${successCount} জন`);
  console.log(`📷 Default photo দেওয়া হয়েছে: ${defaultCount} জন`);
  console.log(`⏭️  Skip করা হয়েছে: ${skipCount} জন`);
  console.log("═══════════════════════════════════════");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
