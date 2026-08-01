import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Department Short Codes
// ─────────────────────────────────────────────
const DEPT = {
  CSE: "CSE",
  EEE: "EEE",
  CE: "CE",
  SOBE: "SoBE",
  ECO: "ECO",
  INS: "INS",
  ENG: "ENG",
  EDS: "EDS",
  MSJ: "MSJ",
  PHARMACY: "PHARMACY",
  BGE: "BSBGE",
};

// ─────────────────────────────────────────────
// Faculty Lists (সব ডেটা UIU official website থেকে)
// ─────────────────────────────────────────────

const cseFacultyList = [
  { name: "Dr. Md. Abul Kashem Mia", designation: "Vice Chancellor", email: "kashem@uiu.ac.bd", roomNumber: "" },
  { name: "Dr. Hasan Sarwar", designation: "Professor & Dean, SoSE", email: "hsarwar@cse.uiu.ac.bd", roomNumber: "3001" },
  { name: "Dr. Mohammad Nurul Huda", designation: "Professor", email: "mnh@cse.uiu.ac.bd", roomNumber: "3103" },
  { name: "Dr. Khondaker Abdullah-Al-Mamun", designation: "Professor, Director MSCSE Program & Director IRIIC", email: "mamun@cse.uiu.ac.bd", roomNumber: "3115" },
  { name: "Dr. A.K.M. Muzahidul Islam", designation: "Professor", email: "muzahid@cse.uiu.ac.bd", roomNumber: "3116" },
  { name: "Dr. Md. Motaharul Islam", designation: "Professor", email: "motaharul@cse.uiu.ac.bd", roomNumber: "3108" },
  { name: "Dr. Al-Sakib Khan Pathan", designation: "Professor", email: "sakib@cse.uiu.ac.bd", roomNumber: "3122" },
  { name: "Dr. Muhammad Nomani Kabir", designation: "Professor", email: "kabir@cse.uiu.ac.bd", roomNumber: "3127" },
  { name: "Dr. Md. Shohrab Hossain", designation: "Professor", email: "shohrab@cse.uiu.ac.bd", roomNumber: "3136" },
  { name: "Dr. Dewan Md. Farid", designation: "Professor-On Leave", email: "dewanfarid@cse.uiu.ac.bd", roomNumber: "3132" },
  { name: "Dr. Mohammad Shahriar Rahman", designation: "Professor-On Leave", email: "mshahriar@cse.uiu.ac.bd", roomNumber: "1401" },
  { name: "Dr. Suman Ahmmed", designation: "Head & Associate Professor, Director CDIP", email: "suman@cse.uiu.ac.bd", roomNumber: "3101" },
  { name: "Dr. Jannatun Noor Mukta", designation: "Associate Professor & Director Data Science Program", email: "jannatun@cse.uiu.ac.bd", roomNumber: "3102" },
  { name: "Dr. Ohidujjaman", designation: "Associate Professor", email: "ohidujjaman@cse.uiu.ac.bd", roomNumber: "" },
  { name: "Md. Saddam Hossain Mukta", designation: "Associate Professor-On Leave", email: "saddam@cse.uiu.ac.bd", roomNumber: "3126" },
  { name: "Dr. Riasat Azim", designation: "Assistant Professor", email: "riasat@cse.uiu.ac.bd", roomNumber: "5114" },
  { name: "Dr. Nahid Ferdous Aurna", designation: "Assistant Professor", email: "aurna@cse.uiu.ac.bd", roomNumber: "5124" },
  { name: "Mohammad Mamun Elahi", designation: "Assistant Professor & Director CITS", email: "mmelahi@cse.uiu.ac.bd", roomNumber: "1401" },
  { name: "Rubaiya Rahtin Khan", designation: "Assistant Professor", email: "rubaiya@cse.uiu.ac.bd", roomNumber: "3110" },
  { name: "Md. Benzir Ahmed", designation: "Assistant Professor", email: "benzir@cse.uiu.ac.bd", roomNumber: "3308" },
  { name: "Nahid Hossain", designation: "Assistant Professor & UG Program Coordinator", email: "nahid@cse.uiu.ac.bd", roomNumber: "3117" },
  { name: "Sadia Islam", designation: "Assistant Professor", email: "sadia@cse.uiu.ac.bd", roomNumber: "5124" },
  { name: "Mir Moynuddin Ahmed Shibly", designation: "Assistant Professor", email: "moynuddin@cse.uiu.ac.bd", roomNumber: "3309" },
  { name: "Anika Tasnim Rodela", designation: "Assistant Professor", email: "anika@cse.uiu.ac.bd", roomNumber: "3146" },
  { name: "Khushnur Binte Jahangir", designation: "Assistant Professor", email: "khushnur@cse.uiu.ac.bd", roomNumber: "6102" },
  { name: "Shoib Ahmed Shourav", designation: "Assistant Professor", email: "shoib@cse.uiu.ac.bd", roomNumber: "3309" },
  { name: "Fahim Hafiz", designation: "Assistant Professor", email: "fahimhafiz@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Md. Tarek Hasan", designation: "Assistant Professor & UG Program Coordinator", email: "tarek@cse.uiu.ac.bd", roomNumber: "3145" },
  { name: "Md. Rayhan Ahmed", designation: "Assistant Professor-On Leave", email: "rayhan@cse.uiu.ac.bd", roomNumber: "3110" },
  { name: "Abu Shafin Mohammad Mahdee Jameel", designation: "Assistant Professor-On Leave", email: "mahdee@cse.uiu.ac.bd", roomNumber: "3114" },
  { name: "Nusrat Jahan Tithi", designation: "Assistant Professor-On Leave", email: "nusrat@cse.uiu.ac.bd", roomNumber: "3146" },
  { name: "Minhajul Bashir", designation: "Lecturer", email: "minhajul@cse.uiu.ac.bd", roomNumber: "3121" },
  { name: "Nabila Sabrin Sworna", designation: "Lecturer", email: "nabila@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Farhan Anan Himu", designation: "Lecturer", email: "himu@cse.uiu.ac.bd", roomNumber: "3309" },
  { name: "Md. Romizul Islam", designation: "Lecturer", email: "romizul@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Samin Sharaf Somik", designation: "Lecturer", email: "samin@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Iftekharul Abedeen", designation: "Lecturer", email: "iftekharul@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Kazi Abdun Noor", designation: "Lecturer", email: "abdunnoor@cse.uiu.ac.bd", roomNumber: "6102" },
  { name: "Md. Muhyminul Haque", designation: "Lecturer", email: "muhyminul@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Md. Shadman Aadeeb", designation: "Lecturer", email: "shadman@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Umama Rahman", designation: "Lecturer", email: "umama@cse.uiu.ac.bd", roomNumber: "3135" },
  { name: "Charles Aunkan Gomes", designation: "Lecturer", email: "charles@cse.uiu.ac.bd", roomNumber: "" },
  { name: "Md. Shafqat Talukder", designation: "Lecturer", email: "shafqat@cse.uiu.ac.bd", roomNumber: "3127" },
  { name: "Asif Ahmed Utsa", designation: "Lecturer", email: "asif@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Md. Tanvir Raihan", designation: "Lecturer", email: "tanvir@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Sidratul Muntaha", designation: "Lecturer", email: "sidratul@cse.uiu.ac.bd", roomNumber: "3135" },
  { name: "Taki Yashir", designation: "Lecturer", email: "taki@cse.uiu.ac.bd", roomNumber: "6102" },
  { name: "Md. Abid Hossain", designation: "Lecturer", email: "abid@cse.uiu.ac.bd", roomNumber: "6103" },
  { name: "Asnuva Tanvin", designation: "Lecturer", email: "tanvin@cse.uiu.ac.bd", roomNumber: "3135" },
  { name: "Tahmid Mosaddeque", designation: "Lecturer", email: "mosaddeque@cse.uiu.ac.bd", roomNumber: "7104" },
  { name: "Tasmin Sanjida", designation: "Lecturer", email: "sanjida@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Azizur Rahman Anik", designation: "Lecturer", email: "azizur@cse.uiu.ac.bd", roomNumber: "3133" },
  { name: "A.H.M. Osama Haque", designation: "Lecturer", email: "osama@cse.uiu.ac.bd", roomNumber: "3133" },
  { name: "Khandokar Md. Rahat Hossain", designation: "Lecturer", email: "rahat@cse.uiu.ac.bd", roomNumber: "3134" },
  { name: "Noman Asif Aditya", designation: "Lecturer", email: "aditya@cse.uiu.ac.bd", roomNumber: "3133" },
  { name: "Md. Mushfiqul Haque Omi", designation: "Lecturer", email: "mushfiqul@cse.uiu.ac.bd", roomNumber: "3134" },
  { name: "Tanmoy Bipro Das", designation: "Lecturer", email: "tanmoy@cse.uiu.ac.bd", roomNumber: "3134" },
  { name: "Humaira Anzum Neha", designation: "Lecturer", email: "humaira@cse.uiu.ac.bd", roomNumber: "3134" },
  { name: "M. Fahmin Rahman", designation: "Lecturer", email: "fahmin@cse.uiu.ac.bd", roomNumber: "3134" },
  { name: "Shekh Md. Saifur Rahman", designation: "Lecturer", email: "saifur@cse.uiu.ac.bd", roomNumber: "3134" },
  { name: "Shihab Ahmed", designation: "Lecturer", email: "shihab@cse.uiu.ac.bd", roomNumber: "3121" },
  { name: "Sidratul Tanzila Tasmi", designation: "Lecturer", email: "tanzila@cse.uiu.ac.bd", roomNumber: "3121" },
  { name: "Sherajul Arifin", designation: "Lecturer", email: "sherajul@cse.uiu.ac.bd", roomNumber: "3134" },
  { name: "Mobaswirul Islam", designation: "Lecturer", email: "mobaswirul@cse.uiu.ac.bd", roomNumber: "6102" },
  { name: "Abdullah Ibne Masud Mahi", designation: "Lecturer", email: "ibnemasud@cse.uiu.ac.bd", roomNumber: "7210" },
  { name: "Mahmudul Hasan", designation: "Lecturer", email: "mahmudul@cse.uiu.ac.bd", roomNumber: "3133" },
  { name: "Muhammad Anwarul Azim", designation: "Lecturer", email: "anwarul@cse.uiu.ac.bd", roomNumber: "6103" },
  { name: "Sajid Ahmed Chowdhury", designation: "Lecturer", email: "sajidahmed@cse.uiu.ac.bd", roomNumber: "" },
  { name: "Sabah Ahmed", designation: "Lecturer", email: "sabah@cse.uiu.ac.bd", roomNumber: "3141" },
  { name: "Rakib Ahsan", designation: "Lecturer", email: "rakib@cse.uiu.ac.bd", roomNumber: "3141" },
  { name: "Rakibul Hasan Rafi", designation: "Lecturer", email: "rakibulhasan@cse.uiu.ac.bd", roomNumber: "3141" },
  { name: "Md. Muhaiminul Islam Nafi", designation: "Lecturer", email: "muhaiminul@cse.uiu.ac.bd", roomNumber: "3141" },
  { name: "Imran Hossain", designation: "Lecturer", email: "imran@cse.uiu.ac.bd", roomNumber: "3142" },
  { name: "Fairoz Anika", designation: "Lecturer", email: "fairoz@cse.uiu.ac.bd", roomNumber: "3143" },
  { name: "Didarul Islam Didar", designation: "Lecturer", email: "didarul@cse.uiu.ac.bd", roomNumber: "3142" },
  { name: "Tasmia Binte Sogir", designation: "Lecturer", email: "tasmia@cse.uiu.ac.bd", roomNumber: "3142" },
  { name: "Tahsin Wahid", designation: "Lecturer", email: "tahsin@cse.uiu.ac.bd", roomNumber: "3143" },
  { name: "Pranta Biswas", designation: "Lecturer", email: "pranta@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Rizvan Jawad Ruhan", designation: "Lecturer", email: "rizvan@cse.uiu.ac.bd", roomNumber: "3134" },
  { name: "Anudwaipaon Antu", designation: "Lecturer", email: "anudwaipaon@cse.uiu.ac.bd", roomNumber: "" },
  { name: "Arnab Bhattacharjee", designation: "Lecturer", email: "arnab@cse.uiu.ac.bd", roomNumber: "3139" },
  { name: "Rafid Nahiyan Farabi", designation: "Lecturer", email: "rafid@cse.uiu.ac.bd", roomNumber: "3139" },
  { name: "Shahriar Mahmud", designation: "Lecturer", email: "shahriarmahmud@cse.uiu.ac.bd", roomNumber: "3139" },
  { name: "Nusaiba Zaman Manifa", designation: "Lecturer", email: "manifa@cse.uiu.ac.bd", roomNumber: "3142" },
  { name: "Sayem Shahad", designation: "Lecturer", email: "sayem@cse.uiu.ac.bd", roomNumber: "3139" },
  { name: "Hafijul Hoque Chowdhury", designation: "Lecturer", email: "hafijul@cse.uiu.ac.bd", roomNumber: "3143" },
  { name: "Abrar Mahmud", designation: "Lecturer", email: "abrar@cse.uiu.ac.bd", roomNumber: "3143" },
  { name: "Asif Abrar", designation: "Lecturer", email: "asifabrar@cse.uiu.ac.bd", roomNumber: "3143" },
  { name: "Md. Sajjad Hossain", designation: "Lecturer", email: "sajjad@cse.uiu.ac.bd", roomNumber: "3143" },
  { name: "Md. Zunaid-Ul-Alam", designation: "Lecturer", email: "zunaid@cse.uiu.ac.bd", roomNumber: "3143" },
  { name: "Siana Rizwan", designation: "Lecturer", email: "siana@cse.uiu.ac.bd", roomNumber: "3143" },
  { name: "Md. Siam", designation: "Lecturer", email: "siam@cse.uiu.ac.bd", roomNumber: "" },
  { name: "Ashraful Islam Paran", designation: "Lecturer", email: "paran@cse.uiu.ac.bd", roomNumber: "" },
  { name: "Nahin F. Siddiqui", designation: "Lecturer", email: "nahin@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Anindya Hoque", designation: "Lecturer", email: "anindya@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Syed Abu Ammar Muhammad Zarif", designation: "Lecturer", email: "zarif@cse.uiu.ac.bd", roomNumber: "" },
  { name: "Saqif Kaisar", designation: "Lecturer", email: "saqif@cse.uiu.ac.bd", roomNumber: "" },
  { name: "Syed Samin Sadaf", designation: "Lecturer", email: "sadaf@cse.uiu.ac.bd", roomNumber: "3309" },
  { name: "Sheikh Adilina", designation: "Lecturer-On Leave", email: "adilina@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Irtesam Mahmud Khan", designation: "Lecturer-On Leave", email: "mahmud@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Md. Sakibur Rahman Sajal", designation: "Lecturer-On Leave", email: "sakibur@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Ashratuz Zavin Asha", designation: "Lecturer-On Leave", email: "ashzavin@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Rifat Bin Rashid", designation: "Lecturer-On Leave", email: "rifatbinrashid@cse.uiu.ac.bd", roomNumber: "3127" },
  { name: "Md. Hasan Al Kayem", designation: "Lecturer-On Leave", email: "hasan@cse.uiu.ac.bd", roomNumber: "5115" },
  { name: "Md. Jahidul Hoq Emon", designation: "Lecturer-On Leave", email: "jahidul@cse.uiu.ac.bd", roomNumber: "" },
  { name: "Subangkar Karmaker Shanto", designation: "Lecturer-On Leave", email: "shanto@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Md. Ashiqur Rahman", designation: "Lecturer-On Leave", email: "ashiqurrahman@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Raiyan Rahman", designation: "Lecturer-On Leave", email: "raiyan@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Md. Mohaiminul Islam", designation: "Lecturer-On Leave", email: "mohaiminul@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Abdullah Al Jobair", designation: "Lecturer-On Leave", email: "jobair@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Fahmid Al Rifat", designation: "Lecturer-On Leave", email: "fahmid@cse.uiu.ac.bd", roomNumber: "" },
  { name: "Sk. Md. Tauseef Tajwar", designation: "Lecturer-On Leave", email: "tauseef@cse.uiu.ac.bd", roomNumber: "3121" },
  { name: "Md. Tamzid Hossain", designation: "Lecturer-On Leave", email: "tamzid@cse.uiu.ac.bd", roomNumber: "3109" },
  { name: "Tapotosh Ghosh", designation: "Lecturer-On Leave", email: "tapotosh@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Md. Saidul Hoque Anik", designation: "Lecturer-On Leave", email: "anik@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Fahim Anzum", designation: "Lecturer-On Leave", email: "fahim@cse.uiu.ac.bd", roomNumber: "3113" },
  { name: "Md. Nafis Tahmid Akhand", designation: "Lecturer-On Leave", email: "tahmid@cse.uiu.ac.bd", roomNumber: "5115" },
];

const eeeFacultyList = [
  { name: "Dr. M. Rezwan Khan", designation: "Professor Emeritus & Director IAR", email: "rezwanm@uiu.ac.bd", roomNumber: "1004" },
  { name: "Dr. Md. Fayyaz Khan", designation: "Professor", email: "fayyaz@eee.uiu.ac.bd", roomNumber: "3323" },
  { name: "Dr. Siddique Md. Lutful Kabir", designation: "Professor", email: "lutfulkabir@eee.uiu.ac.bd", roomNumber: "3322" },
  { name: "Dr. Raqibul Mostafa", designation: "Professor", email: "rmostafa@eee.uiu.ac.bd", roomNumber: "3304" },
  { name: "Dr. Intekhab Alam", designation: "Professor", email: "intekhab@eee.uiu.ac.bd", roomNumber: "3321" },
  { name: "Dr. Kaled Masukur Rahman", designation: "Professor & Head of Dept.", email: "masuk@eee.uiu.ac.bd", roomNumber: "3301" },
  { name: "Dr. Md. Iqbal Bahar Chowdhury", designation: "Professor", email: "iqbal@eee.uiu.ac.bd", roomNumber: "3305" },
  { name: "Dr. Sadid Muneer", designation: "Associate Professor & Undergraduate Coordinator", email: "sadidmuneer@eee.uiu.ac.bd", roomNumber: "3312" },
  { name: "Dr. Md. Hasanuzzaman", designation: "Associate Professor", email: "hasanuzzaman@eee.uiu.ac.bd", roomNumber: "3327" },
  { name: "Md. Shahriar Ahmed Chowdhury", designation: "Assistant Professor & Director CER", email: "shahriar@eee.uiu.ac.bd", roomNumber: "3320" },
  { name: "B.K.M. Mizanur Rahman", designation: "Assistant Professor", email: "mizan@eee.uiu.ac.bd", roomNumber: "3308" },
  { name: "Helena Bulbul", designation: "Lecturer", email: "helena@eee.uiu.ac.bd", roomNumber: "7104" },
  { name: "Md. Nure-Alam-Dipu", designation: "Lecturer", email: "nurealam@eee.uiu.ac.bd", roomNumber: "3113" },
  { name: "Kazi Abrar Mahmud", designation: "Lecturer", email: "abrar@eee.uiu.ac.bd", roomNumber: "3309" },
  { name: "Akif Hamid", designation: "Lecturer", email: "akif@eee.uiu.ac.bd", roomNumber: "3309" },
  { name: "Syed Moktacim Billah", designation: "Lecturer", email: "moktacim@eee.uiu.ac.bd", roomNumber: "3309" },
  { name: "Md. Mostaqul Islam", designation: "Lecturer", email: "mostaqul@eee.uiu.ac.bd", roomNumber: "3309" },
  { name: "Liakat Omar Rihan", designation: "Lecturer", email: "liakat@eee.uiu.ac.bd", roomNumber: "3309" },
  { name: "Md. Kamrul Bari", designation: "Part-time Faculty", email: "bari.sarkar@gmail.com", roomNumber: "" },
  { name: "Khawza Iftekhar Uddin Ahmed", designation: "Professor-On Leave", email: "khawza@eee.uiu.ac.bd", roomNumber: "3302" },
  { name: "GMA Ehsan ur Rahman", designation: "Assistant Professor-On Leave", email: "erahman@eee.uiu.ac.bd", roomNumber: "" },
  { name: "Md. Zubair Alam Emon", designation: "Lecturer-On Leave", email: "zubair@eee.uiu.ac.bd", roomNumber: "3309" },
  { name: "Raiyan Basher", designation: "Lecturer-On Leave", email: "raiyan@eee.uiu.ac.bd", roomNumber: "3121" },
  { name: "S.M. Haider Ali Shuvo", designation: "Lecturer-On Leave", email: "haiderali@eee.uiu.ac.bd", roomNumber: "" },
  { name: "S.M. Monzurul Hoque Chowdhury", designation: "Lecturer-On Leave", email: "monzurul@eee.uiu.ac.bd", roomNumber: "" },
  { name: "Mehenaz Afrin", designation: "Lecturer-On Leave", email: "mehenaz@eee.uiu.ac.bd", roomNumber: "" },
  { name: "Tasnia Tanjim Mim", designation: "Lecturer-On Leave", email: "tasnia@eee.uiu.ac.bd", roomNumber: "7104" },
];

const ceFacultyList = [
  { name: "Dr. Md. Mujibur Rahman", designation: "Professor", email: "mujibur@ce.uiu.ac.bd", roomNumber: "3506" },
  { name: "Dr. Rumana Afrin", designation: "Associate Professor & Head of Dept.", email: "rumana@ce.uiu.ac.bd", roomNumber: "3501" },
  { name: "Dr. Md. Saiful Islam", designation: "Assistant Professor", email: "saiful@ce.uiu.ac.bd", roomNumber: "7202" },
  { name: "Nafisa Tabassum", designation: "Assistant Professor", email: "nafisa@ce.uiu.ac.bd", roomNumber: "3502" },
  { name: "Jamil Ahmed Joy", designation: "Assistant Professor", email: "jamil@ce.uiu.ac.bd", roomNumber: "7202" },
  { name: "Tasfiqur Rohman Ananta", designation: "Lecturer", email: "tasfiqur@ce.uiu.ac.bd", roomNumber: "3502" },
  { name: "Shahriare Mahmud Sakib", designation: "Lecturer", email: "shahriare@ce.uiu.ac.bd", roomNumber: "3502" },
  { name: "Jannatul Ferdows Nowrin", designation: "Lecturer", email: "jannatul@ce.uiu.ac.bd", roomNumber: "3502" },
  { name: "Shishir Shahriar Arif", designation: "Lecturer", email: "shishir@ce.uiu.ac.bd", roomNumber: "7104" },
  { name: "Md. Hossain Safayet", designation: "Lecturer", email: "safayet@ce.uiu.ac.bd", roomNumber: "3133" },
  { name: "Ahnaf Rafi Sharan", designation: "Lecturer", email: "ahnaf@ce.uiu.ac.bd", roomNumber: "3134" },
  { name: "Dr. Abdullah Al-Muyeed", designation: "Guest Faculty-Professor", email: "abdullah.ptfaculty@ce.uiu.ac.bd", roomNumber: "" },
  { name: "Dr. Farzana Rahman", designation: "Professor-On Leave", email: "farzana@ce.uiu.ac.bd", roomNumber: "3505" },
  { name: "Md. Asif Bin Kabir", designation: "Assistant Professor-On Leave", email: "asif@ce.uiu.ac.bd", roomNumber: "7202" },
];

const sobeFacultyList = [
  { name: "Dr. M Niaz Asadullah", designation: "Advisor - Adjunct, School of Business and Economics", email: "niaz@eco.uiu.ac.bd", roomNumber: "5001" },
  { name: "Dr. Mohammad Musa", designation: "Professor", email: "mmusa@uiu.ac.bd", roomNumber: "5105" },
  { name: "Dr. Salma Karim", designation: "Professor & Director BBA Program", email: "salma@bus.uiu.ac.bd", roomNumber: "5101" },
  { name: "Dr. Abu Saleh Md. Sohel-Uz-Zaman", designation: "Professor", email: "sohel@bus.uiu.ac.bd", roomNumber: "5120" },
  { name: "Dr. Mohd. H. R. Joarder", designation: "Professor", email: "raihan.joarder@bus.uiu.ac.bd", roomNumber: "5128" },
  { name: "Dr. Md. Mohan Uddin", designation: "Professor", email: "mohanuddin@bus.uiu.ac.bd", roomNumber: "5106" },
  { name: "Dr. Kawsar Ahmmed", designation: "Professor & Director MBA EMBA MIHRM Programs", email: "kawsar@bus.uiu.ac.bd", roomNumber: "5111" },
  { name: "Dr. Khandoker Mahmudur Rahman", designation: "Professor", email: "khandoker@bus.uiu.ac.bd", roomNumber: "5130" },
  { name: "Dr. Md. Shariful Alam", designation: "Professor", email: "shariful@bus.uiu.ac.bd", roomNumber: "5142" },
  { name: "Dr. James Bakul Sarkar", designation: "Professor & Coordinator BBA in AIS", email: "jmssarkar@bus.uiu.ac.bd", roomNumber: "5103" },
  { name: "Dr. Md. Qamruzzaman", designation: "Professor & Director IBER", email: "qamruzzaman@bus.uiu.ac.bd", roomNumber: "5107" },
  { name: "Dr. Seyama Sultana", designation: "Professor", email: "seyama@bus.uiu.ac.bd", roomNumber: "5138" },
  { name: "Dr. Gouranga Chandra Debnath", designation: "Professor", email: "gouranga@bus.uiu.ac.bd", roomNumber: "5131" },
  { name: "Dr. Saad Hasan", designation: "Associate Professor", email: "saadhasan@bus.uiu.ac.bd", roomNumber: "5141" },
  { name: "Dr. Mohammad Tariq Hasan", designation: "Associate Professor & Deputy Director BBA", email: "tariq@bus.uiu.ac.bd", roomNumber: "5139" },
  { name: "Dr. Sarker Rafij Ahmed Ratan", designation: "Associate Professor", email: "rafij@bus.uiu.ac.bd", roomNumber: "5143" },
  { name: "Dr. Mofijul Hoq Masum", designation: "Associate Professor & Director IQAC", email: "masum@bus.uiu.ac.bd", roomNumber: "2001" },
  { name: "Dr. Md. Kaium Hossain", designation: "Associate Professor & Director CIAC", email: "kaium@bus.uiu.ac.bd", roomNumber: "6201" },
  { name: "Dr. Shakila Aziz", designation: "Associate Professor", email: "shakila@bus.uiu.ac.bd", roomNumber: "5113" },
  { name: "Dr. Abu Zafar Md. Rashed Osman", designation: "Associate Professor-On Leave", email: "rashed@bus.uiu.ac.bd", roomNumber: "5109" },
  { name: "Dr. Mirza Mohammad Didarul Alam", designation: "Associate Professor-On Leave", email: "mirza@bus.uiu.ac.bd", roomNumber: "" },
  { name: "Dr. Mohammad Shamsul Alam Wasimi", designation: "Assistant Professor", email: "shamsul@bus.uiu.ac.bd", roomNumber: "5116" },
  { name: "Mohammad Behroz Jalil", designation: "Assistant Professor", email: "mbjalil@bus.uiu.ac.bd", roomNumber: "5112" },
  { name: "Mosabbir Uddin Ahmad", designation: "Assistant Professor", email: "mosabbir@bus.uiu.ac.bd", roomNumber: "5116" },
  { name: "Muhammad Enamul Haque", designation: "Assistant Professor", email: "enamul@bus.uiu.ac.bd", roomNumber: "5117" },
  { name: "Shayla Khanam", designation: "Assistant Professor", email: "shayla@bus.uiu.ac.bd", roomNumber: "5117" },
  { name: "Ishrat Sultana", designation: "Assistant Professor", email: "ishrat@bus.uiu.ac.bd", roomNumber: "5124" },
  { name: "Dr. Mimnun Sultana", designation: "Assistant Professor", email: "mimnun@bus.uiu.ac.bd", roomNumber: "5119" },
  { name: "Muhammad Hasan Al-Mamun", designation: "Assistant Professor", email: "mamun@bus.uiu.ac.bd", roomNumber: "5122" },
  { name: "Nasrin Akter", designation: "Assistant Professor", email: "nasrin@bus.uiu.ac.bd", roomNumber: "5113" },
  { name: "Zinnatun Nesa", designation: "Assistant Professor", email: "zinnatun@bus.uiu.ac.bd", roomNumber: "5117" },
  { name: "Mohammad Tohidul Islam Miya", designation: "Assistant Professor", email: "tohid@bus.uiu.ac.bd", roomNumber: "5116" },
  { name: "Ishrat Jahan", designation: "Assistant Professor", email: "ishrat_jahan@bus.uiu.ac.bd", roomNumber: "5118" },
  { name: "Md. Kazimul Hoque", designation: "Assistant Professor", email: "kazimul@bus.uiu.ac.bd", roomNumber: "5123" },
  { name: "Jakowan", designation: "Assistant Professor & Deputy Director IQAC", email: "jakowan@bus.uiu.ac.bd", roomNumber: "2002" },
  { name: "Ahmed Imran Kabir", designation: "Assistant Professor", email: "ahmedimran@bus.uiu.ac.bd", roomNumber: "5115" },
  { name: "Nusrat Farzana", designation: "Assistant Professor-On Study Leave", email: "farzana@bus.uiu.ac.bd", roomNumber: "5124" },
  { name: "Rana Mazumder", designation: "Assistant Professor-On Study Leave", email: "rana@bus.uiu.ac.bd", roomNumber: "5123" },
  { name: "Ziaul Karim", designation: "Assistant Professor-On Study Leave", email: "ziaul@bus.uiu.ac.bd", roomNumber: "5125" },
  { name: "Eliza Huq", designation: "Assistant Professor-On Leave", email: "eliza@bus.uiu.ac.bd", roomNumber: "5119" },
  { name: "Lamia Alam", designation: "Assistant Professor-On Leave", email: "lamiaalam@bus.uiu.ac.bd", roomNumber: "5115" },
  { name: "Mohammad Amzad Hossain", designation: "Assistant Professor-On Leave", email: "mahossain@bus.uiu.ac.bd", roomNumber: "5123" },
  { name: "Piana Monsur Mindia", designation: "Assistant Professor-On Leave", email: "piana@bus.uiu.ac.bd", roomNumber: "5124" },
  { name: "Jerin Haque Chhanda", designation: "Lecturer", email: "jerin@bus.uiu.ac.bd", roomNumber: "6103" },
  { name: "Imtiaz Zahan Chowdhury", designation: "Lecturer", email: "imtiazzahan@bus.uiu.ac.bd", roomNumber: "3127" },
  { name: "Israt Jabin", designation: "Lecturer", email: "israt@bus.uiu.ac.bd", roomNumber: "5115" },
  { name: "Rukaiya Rob", designation: "Lecturer", email: "rukaiya@bus.uiu.ac.bd", roomNumber: "3121" },
  { name: "Mahbuba Sultana", designation: "Lecturer", email: "mahbuba@bus.uiu.ac.bd", roomNumber: "3128" },
  { name: "Nafisa Rahman", designation: "Lecturer", email: "nafisa@bus.uiu.ac.bd", roomNumber: "3128" },
  { name: "Montaha Ayub Vasha", designation: "Lecturer", email: "montaha@bus.uiu.ac.bd", roomNumber: "" },
  { name: "Nazmul Huda Mohd. Sharif Uddin", designation: "Part-time Faculty", email: "sharifnazmul01@gmail.com", roomNumber: "" },
  { name: "Abdullah Al Fahad", designation: "Part-time Faculty", email: "aaf5623@gmail.com", roomNumber: "" },
  { name: "Muhammad Shahidul Islam", designation: "Part-time Faculty", email: "msislam053@gmail.com", roomNumber: "" },
  { name: "Sadia Binte Anwar", designation: "Part-time Faculty", email: "sba.sadia19@gmail.com", roomNumber: "" },
];

const ecoFacultyList = [
  { name: "Dr. Mohammad Omar Farooq", designation: "Professor & Head of Dept.", email: "farooq@eco.uiu.ac.bd", roomNumber: "5201" },
  { name: "Dr. Mohammad A. Ashraf", designation: "Professor", email: "mashraf@eco.uiu.ac.bd", roomNumber: "5205" },
  { name: "Dr. Mohammad Akhtaruzzaman", designation: "Professor", email: "akhtaruzzaman@eco.uiu.ac.bd", roomNumber: "5206" },
  { name: "Dr. Mohammad Akhtar Hossain", designation: "Professor-On Leave", email: "akhtar@eco.uiu.ac.bd", roomNumber: "5206" },
  { name: "Musharrat Shabnam Shuchi", designation: "Assistant Professor", email: "shabnam@eco.uiu.ac.bd", roomNumber: "5113" },
  { name: "Tanseer Ahamed", designation: "Assistant Professor", email: "tanseer@eco.uiu.ac.bd", roomNumber: "6102" },
  { name: "Tanzila Amir", designation: "Lecturer", email: "tanzila@eco.uiu.ac.bd", roomNumber: "6102" },
  { name: "Sayeda Chandra Tabassum", designation: "Lecturer", email: "tabassum@eco.uiu.ac.bd", roomNumber: "6102" },
  { name: "Tasneem Jahan Tumpa", designation: "Lecturer", email: "tumpa@eco.uiu.ac.bd", roomNumber: "6102" },
  { name: "Syed Mahbub Rahman", designation: "Part-time Faculty", email: "srahman@hum.buet.ac.bd", roomNumber: "" },
  { name: "Asiya Siddica", designation: "Part-time Faculty", email: "boby_siddica1986@yahoo.com", roomNumber: "" },
];

const insFacultyList = [
  { name: "Dr. Md. Abu Saklayen", designation: "Professor", email: "saklayen@ins.uiu.ac.bd", roomNumber: "6101" },
  { name: "Dr. Hasin Anupama Azhari", designation: "Professor", email: "ahanupama@ins.uiu.ac.bd", roomNumber: "6106" },
  { name: "Dr. Abdullah Al Mamun", designation: "Associate Professor", email: "mamun@ins.uiu.ac.bd", roomNumber: "6105" },
  { name: "Dr. Mahtab Uddin", designation: "Associate Professor", email: "mahtab@ins.uiu.ac.bd", roomNumber: "6107" },
  { name: "Dr. Jashodhan Saha", designation: "Assistant Professor & Coordinator Undergraduate Programs", email: "jsaha@ins.uiu.ac.bd", roomNumber: "6108" },
  { name: "Mohammad Mahboob Ali Siddiqi", designation: "Assistant Professor", email: "mahboob@ins.uiu.ac.bd", roomNumber: "6104" },
  { name: "Sagar Dutta", designation: "Assistant Professor", email: "sagar@ins.uiu.ac.bd", roomNumber: "6104" },
  { name: "Md. Asaduzzaman", designation: "Lecturer", email: "asad@ins.uiu.ac.bd", roomNumber: "6103" },
  { name: "Muhaiminul Islam Adnan", designation: "Lecturer", email: "adnan@ins.uiu.ac.bd", roomNumber: "6103" },
  { name: "Nasrina Parvin", designation: "Lecturer", email: "nasrina@ins.uiu.ac.bd", roomNumber: "6103" },
  { name: "Ashek Ahmed", designation: "Lecturer", email: "ashek@ins.uiu.ac.bd", roomNumber: "6103" },
  { name: "Gourab Kumar Roy", designation: "Lecturer-On Leave", email: "gourab@ins.uiu.ac.bd", roomNumber: "6103" },
];

const engFacultyList = [
  { name: "Dr. Md. Kamrul Hasan", designation: "Professor", email: "kamrul@english.uiu.ac.bd", roomNumber: "7107" },
  { name: "Dr. Marzia Shurovi", designation: "Associate Professor & Head of Dept.", email: "shurovi@english.uiu.ac.bd", roomNumber: "7101" },
  { name: "Saima Hasin", designation: "Assistant Professor", email: "saimahasin@english.uiu.ac.bd", roomNumber: "7102" },
  { name: "Nousin Laila Bristi", designation: "Assistant Professor", email: "nousin@english.uiu.ac.bd", roomNumber: "3146" },
  { name: "Chowdhury Omar Sharif", designation: "Assistant Professor", email: "sharif@english.uiu.ac.bd", roomNumber: "3308" },
  { name: "Ms. Kirsten Gudgeon", designation: "Lecturer", email: "gudgeon@english.uiu.ac.bd", roomNumber: "3135" },
  { name: "Sadia Afrin", designation: "Lecturer", email: "sadia@english.uiu.ac.bd", roomNumber: "7104" },
  { name: "Umme Habiba", designation: "Lecturer", email: "habiba@english.uiu.ac.bd", roomNumber: "3142" },
  { name: "Labib Rashid Inan", designation: "Lecturer", email: "labib@english.uiu.ac.bd", roomNumber: "3142" },
  { name: "Muntasir Ahmad", designation: "Lecturer", email: "muntasir@english.uiu.ac.bd", roomNumber: "" },
  { name: "Ahmed Abdullah Bin Farooqi Rayhan", designation: "Lecturer", email: "abdullah@english.uiu.ac.bd", roomNumber: "" },
  { name: "Tashrifa Fairuz", designation: "Lecturer", email: "tashrifa@english.uiu.ac.bd", roomNumber: "3142" },
  { name: "Md. Didar Hossain", designation: "Assistant Professor-On Leave", email: "didar@eli.uiu.ac.bd", roomNumber: "7101" },
  { name: "Dil Nusrat", designation: "Assistant Professor-On Leave", email: "dil@eli.uiu.ac.bd", roomNumber: "7103" },
  { name: "Saima Akter", designation: "Assistant Professor-On Leave", email: "saima@english.uiu.ac.bd", roomNumber: "7104" },
];

const edsFacultyList = [
  { name: "Dr. Hamidul Huq", designation: "Professor & Dean School of Humanities and Social Sciences", email: "hamidulhuq@eds.uiu.ac.bd", roomNumber: "7000" },
  { name: "Dr. Sharif Ahmed Mukul", designation: "Associate Professor", email: "mukul@eds.uiu.ac.bd", roomNumber: "7204" },
  { name: "Dr. Shantanu Kumar Saha", designation: "Associate Professor & Head of Dept.", email: "shantanu@eds.uiu.ac.bd", roomNumber: "7201" },
  { name: "Dr. Naima Ansar Khan", designation: "Associate Professor", email: "naima@eds.uiu.ac.bd", roomNumber: "7205" },
  { name: "Oliver Tirtho Sarkar", designation: "Assistant Professor", email: "tirtho@eds.uiu.ac.bd", roomNumber: "7203" },
  { name: "Taniah Mahmuda Tinni", designation: "Assistant Professor", email: "taniah@eds.uiu.ac.bd", roomNumber: "7210" },
  { name: "Jemima Jahan Meem", designation: "Lecturer", email: "jemima@eds.uiu.ac.bd", roomNumber: "7203" },
  { name: "Mallika Datta", designation: "Lecturer", email: "mallika@eds.uiu.ac.bd", roomNumber: "7210" },
  { name: "Dr. Sabrina Islam", designation: "Assistant Professor-On Leave", email: "sabrina@eds.uiu.ac.bd", roomNumber: "" },
  { name: "Md. Mizanur Rahman", designation: "Assistant Professor-On Leave", email: "mizanur@eds.uiu.ac.bd", roomNumber: "7203" },
];

const msjFacultyList = [
  { name: "Dr. Sheikh Mohammad Shafiul Islam", designation: "Associate Professor & Head of Dept.", email: "shafiul@msj.uiu.ac.bd", roomNumber: "7401" },
  { name: "Dr. Mario Hirstein", designation: "Assistant Professor", email: "hirstein@msj.uiu.ac.bd", roomNumber: "7402" },
  { name: "Kazi Kamrun Nahar Tania", designation: "Lecturer", email: "tania@msj.uiu.ac.bd", roomNumber: "7402" },
  { name: "Ms. Sumia Zahid", designation: "Lecturer", email: "sumia@msj.uiu.ac.bd", roomNumber: "7402" },
  { name: "Ms. Umme Ammara", designation: "Lecturer", email: "ammara@msj.uiu.ac.bd", roomNumber: "7402" },
];

const pharmacyFacultyList = [
  { name: "Dr. Md. Abdul Mazid", designation: "Advisor - School of Life Sciences", email: "mazid@pharmacy.uiu.ac.bd", roomNumber: "3605" },
  { name: "Dr. Tahmina Foyez", designation: "Head and Professor, Department of Pharmacy", email: "tahmina@pharmacy.uiu.ac.bd", roomNumber: "5501" },
  { name: "Dr. Syed Masudur Rahman Dewan", designation: "Associate Professor", email: "masudur@pharmacy.uiu.ac.bd", roomNumber: "5503" },
  { name: "Dr. Refaya Rezwan", designation: "Assistant Professor", email: "refaya@pharmacy.uiu.ac.bd", roomNumber: "5502" },
  { name: "Sharmin Ahmed Rakhi", designation: "Assistant Professor", email: "sharmin@pharmacy.uiu.ac.bd", roomNumber: "5502" },
  { name: "Sabiha Tasnim", designation: "Assistant Professor", email: "sabiha@pharmacy.uiu.ac.bd", roomNumber: "5502" },
  { name: "Rafe Salman Rifat", designation: "Lecturer", email: "rifat@pharmacy.uiu.ac.bd", roomNumber: "7210" },
  { name: "Mr. Ferdous-Ul-Haque Joy", designation: "Lecturer", email: "ferdous@pharmacy.uiu.ac.bd", roomNumber: "7210" },
  { name: "Rajib Das", designation: "Lecturer", email: "rajibdas@pharmacy.uiu.ac.bd", roomNumber: "7210" },
  { name: "Mst. Nowsad Zahan Sathi", designation: "Lecturer", email: "nowsad@pharmacy.uiu.ac.bd", roomNumber: "7210" },
  { name: "AHM Quamruzzaman", designation: "Guest Faculty", email: "qzaman123@gmail.com", roomNumber: "" },
];

const bgeFacultyList = [
  { name: "Dr. S.M. Rafiqul Islam", designation: "Professor & Head, Department of BGE", email: "rafiqul@bge.uiu.ac.bd", roomNumber: "3701" },
  { name: "Md. Belal Hussain Ripon", designation: "Lecturer", email: "belal@bge.uiu.ac.bd", roomNumber: "7210" },
  { name: "Khalid Shahriar", designation: "Lecturer", email: "shahriar@bge.uiu.ac.bd", roomNumber: "3139" },
  { name: "Md. Zahin Alam", designation: "Lecturer", email: "zahin@bge.uiu.ac.bd", roomNumber: "3139" },
  { name: "Muhammad Sibgatullah Zunnun", designation: "Lecturer", email: "sibgatullah@bge.uiu.ac.bd", roomNumber: "3142" },
  { name: "Dr. Nahid Tamanna", designation: "Assistant Professor-On Leave", email: "tamanna@bge.uiu.ac.bd", roomNumber: "7211" },
];

// ─────────────────────────────────────────────
// Seed করার জন্য department + faculty data map
// ─────────────────────────────────────────────
const allDepartments = [
  { code: DEPT.CSE, facultyList: cseFacultyList },
  { code: DEPT.EEE, facultyList: eeeFacultyList },
  { code: DEPT.CE, facultyList: ceFacultyList },
  { code: DEPT.SOBE, facultyList: sobeFacultyList },
  { code: DEPT.ECO, facultyList: ecoFacultyList },
  { code: DEPT.INS, facultyList: insFacultyList },
  { code: DEPT.ENG, facultyList: engFacultyList },
  { code: DEPT.EDS, facultyList: edsFacultyList },
  { code: DEPT.MSJ, facultyList: msjFacultyList },
  { code: DEPT.PHARMACY, facultyList: pharmacyFacultyList },
  { code: DEPT.BGE, facultyList: bgeFacultyList },
];

async function main() {
  console.log("🌱 UIU Faculty Seeding শুরু হচ্ছে...\n");

  // ────────────────────────────────────────────
  // ১. পুরনো সব faculty এবং department মুছে ফেলা
  // ────────────────────────────────────────────
  console.log("🗑️  পুরনো faculty ডেটা মুছছি...");
  await prisma.faculty.deleteMany({});
  console.log("🗑️  পুরনো department ডেটা মুছছি...");
  await prisma.department.deleteMany({});
  console.log("✅ পুরনো ডেটা সফলভাবে মুছে ফেলা হয়েছে!\n");

  // ────────────────────────────────────────────
  // ২. প্রতিটি department ও faculty insert করা
  // ────────────────────────────────────────────
  let totalFaculty = 0;

  for (const { code, facultyList } of allDepartments) {
    // Department তৈরি করা
    const department = await prisma.department.create({
      data: { name: code },
    });
    console.log(`📂 Department তৈরি: ${department.name} (${facultyList.length} জন faculty)`);

    // Faculty insert করা
    for (const faculty of facultyList) {
      const initial = faculty.email.split("@")[0];

      await prisma.faculty.create({
        data: {
          name: faculty.name,
          email: faculty.email,
          designation: faculty.designation,
          department: code,
          initial: initial,
          status: "APPROVED",
          roomNumber: faculty.roomNumber,
        },
      });
    }

    totalFaculty += facultyList.length;
    console.log(`   ✅ ${facultyList.length} জন faculty সফলভাবে যোগ করা হয়েছে।`);
  }

  console.log(`\n🎉 Seeding সম্পন্ন!`);
  console.log(`📊 মোট Department: ${allDepartments.length} টি`);
  console.log(`👨‍🏫 মোট Faculty: ${totalFaculty} জন`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding ব্যর্থ হয়েছে:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
