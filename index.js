const express = require('express');
const app = express();
const mysql = require('mysql2');
const session = require('express-session');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const xlsxPopulate = require('xlsx-populate');
const { start } = require('repl');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const con = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "root", 
  database: "adventdb"
});
// Parse JSON data in the request body
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// ... Your additional code and routes go here ...
app.use(express.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
  secret: 'fkw45lrk2oP3RG3240QFPO34H6U894R',
  resave: false,
  saveUninitialized: true,
}));

const storage = multer.diskStorage({
  destination: 'public/uploads/', // Directory to save the uploaded files
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Create a unique filename
  }
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("login.ejs");
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "adventoutdoor@gmail.com",
    pass: "gvbgevxplzwxhyms"
  }
});

function generateOTP() {
  return randomstring.generate({
    length: 6,
    charset: 'numeric',
  });
}

app.get("/forgot-password", (req, res) => {
  res.render("forgot.ejs");
});

app.post("/forgot-password", (req, res) => {
  const recipientEmail = req.body.email; 
  con.query("Select * from email where email = ?",[recipientEmail],(err,result)=>{
    if(result.length === 1)
    {
      const otp = generateOTP();

      const mailOptions = {
        from: "bkrishnasaikarthikchandra.20.cse@anits.edu.in",
        to: recipientEmail, // Use the provided email from the form input
        subject: "OTP",
        html: `Your OTP is: <strong>${otp}</strong>`
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.send("Error sending email");
        } else {
          console.log("Email sent: " + info.response);
          res.render("verify-otp.ejs",{otp}); // Render a page to verify OTP, passing the email
        }
      });
    }
    else 
    {
      res.render("p.ejs",{message : "Enter only security email"});
    }
  });

});

app.get("/delete-email/:email",(req,res)=>{
  const email = req.params.email;
  con.query("delete from email where email = ?",[email],(err,results)=>{
    res.redirect("/email-display");
  });
});

app.post("/verify-otp", (req, res) => {
  const enteredOTP = req.body.otp;
  const expectedOTP = req.body.expectedOTP;
  if (enteredOTP === expectedOTP) {
    res.redirect("/change-password");
  } else {
    res.render("p.ejs",{message : "Incorrect OTP"});
    
  }
});

app.get("/change-password",(req,res)=>{
  res.render("change.ejs");
});

app.post("/change-password",(req,res)=>{
  const password = req.body.pwd1;
  const password1 = req.body.pwd2;
  if(password === password1)
  {
    con.query("update auth set password = ?",[password],(err,result)=>{
      res.redirect("/");
    });
  }
  else 
  {
    res.render("p.ejs",{message : "Passwords Not Matched"});
  }
});
app.get("/LandLord", (req, res) => {
  const isLoggedIn = req.session.username;
  if (req.session.username) {
    res.render("LandLordDetails.ejs", { isLoggedIn, id: req.session.admin });
  } else {
    res.redirect("/");
  }
});

app.get("/email",(req,res)=>{
  const isLoggedIn = req.session.username;
  if (req.session.username) {
    res.render("email.ejs", { isLoggedIn, id: req.session.admin });
  } else {
    res.redirect("/");
  }
})

app.post("/email",(req,res)=>{
  const email = req.body.email;
  
  con.query("Insert into email values(?)",[email],(err,results)=>{
      res.redirect("/email");
  });
})
app.get("/email-display", (req, res) => {
  const isLoggedIn = req.session.username;
  
  con.query("SELECT * FROM email", (err, queryResult) => {
    if (err) {
    
      console.error(err);
      res.status(500).send("Error fetching emails");
      return;
    }

   
    res.render("email-display.ejs", {
      isLoggedIn,
      id: req.session.admin,
      results: queryResult 
    });
  });
});


app.post("/LandLord",(req,res)=>{
  const {
    codeno,
    location,
    width,
    height,
    type,
    landlordname,
    sday,
    eday,
    rentamount,
    mcvtax,
  } = req.body;
  const sqlQuery = "INSERT INTO landlord  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [
    codeno,
    location,
    width,
    height,
    type,
    landlordname,
    sday,
    eday,
    rentamount,
    mcvtax,
  ];
  con.query(sqlQuery, values, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      res.render("p.ejs",{message : "database0"})
    
    } else {
     
      res.render("p.ejs",{message : "database1"})
    }
  });  

});



app.get("/LandLordnotification",(req,res)=>{
 
  const isLoggedIn = !!req.session.username;
  if (!isLoggedIn) {
    res.redirect("/");
    return; // Make sure to add a return statement here
  }
  const today = new Date();
  const tenDaysFromToday = new Date(today);
  tenDaysFromToday.setDate(tenDaysFromToday.getDate() + 15);

  const todayFormatted = today.toISOString().split('T')[0];
  const tenDaysFromTodayFormatted = tenDaysFromToday.toISOString().split('T')[0];
  

  const query = `SELECT * FROM landlord WHERE Eday >= '${todayFormatted}' AND Eday <= '${tenDaysFromTodayFormatted}'`;

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).send("Error retrieving data.");
    }
  
    res.render("Landlordnotification.ejs", { data: results , isLoggedIn , id : req.session.admin});
  });
});

app.post("/AdminLogin", (req, res) => {
  const { username, password } = req.body;
  con.query("Select * from auth where username = ? and password = ?",[username,password],(err,results)=>{
    if(results.length == 1)
    {
      req.session.loggedin = true;
      req.session.username = username;
      req.session.admin = 1;
      res.redirect("/page1");
    }
    else
    {
      
      res.render("p.ejs", { message: "Unsuccessful" , id : req.session.admin});

    }
  });
  
});

app.post("/emplogin", (req, res) => {

  const { username, password } = req.body;
  req.session.admin  = 0 
  con.query("Select * from employee where username = ? and password = ?",[username,password],(err,results)=>{
    if(results.length == 1)
    {
      req.session.loggedin = true;
      req.session.username = username;
      req.session.admin = 0;
      res.redirect("/page1");
    }
    else
    {
      
      res.render("p.ejs", { message: "Unsuccessful" , id : req.session.admin});

    }
  });
  
});

app.get("/page1", (req, res) => {
  const isLoggedIn = !!req.session.username;
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Expires", "0");
  res.setHeader("Pragma", "no-cache");
  if (req.session.username) {
  
    res.render("page1.ejs", { session: req.session.username , isLoggedIn,id : req.session.admin});
  } else {
    res.redirect("/");
  }
});

app.post("/page1", upload.single('image'), (req, res) => {
  const {
    company,
    codeno,
    location,
    width,
    height,
    type,
    media,
    latitude,
    longitude,
    display,
    client,
    sday,
    eday,
    landmark,
  } = req.body;

  console.log(req.body);

  const imagePath = req.file.path.slice(7);
  const name = req.file.filename;
  
  const sqlQuery = "INSERT INTO data ( codeno, location, width, height,type, media, longitude, latitude, display,client,sday, eday, landmark, image,company) VALUES (?, ?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
  
  const values = [

    codeno,
    location,
    width,
    height,
    type,
    media,
    longitude,
    latitude,
    display,
    client,
    sday,
    eday,
    landmark,
    name,
    company
  ];
  
  con.query(sqlQuery, values, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      res.render("p.ejs", { message: "database0" });
    } else {
      
      res.render("p.ejs", { message: "database1" });
    }
  });
});

app.get("/employeed", (req, res) => {
  const isLoggedIn = !!req.session.username;
  if(req.session.username)
  {
    con.query("SELECT * FROM employee", (err, results) => {
      if (err) {s
        console.error("Error fetching data:", err);
        res.render("p.ejs", { message: "database0" });
      } else {
        res.render("employeeList.ejs", { results: results , isLoggedIn, id : req.session.admin});
      }
    });
  }
  else 
  {
    res.redirect("/");
  }
}); 

app.get("/edit1/:username",(req,res)=>{
  const isLoggedIn = !!req.session.username;
  const username = req.params.username;
  if(req.session.username)
  {
      con.query("Select * from employee where username = ?",[username],(err,result)=>{
        if (err) {
          console.error("Error inserting data:", err);
          res.render("p.ejs",{message : "database0"});
       } 
       res.render("edit1.ejs",{result: result, isLoggedIn, id : req.session.admin});
      });  
  }
  else
  {
    res.redirect("/");
  }
});

app.post("/edit1/:username",(req,res)=>{
  const username = req.params.username;
  const password = req.body.password;
 
  con.query("update employee set password = ? where username = ? ",[password,username],(err,result)=>{
    if (err) {
      console.error("Error inserting data:", err);
      return res.render("p.ejs",{message : "database0"});
   } 
  
   res.redirect("/employeed");
  });
});

app.get("/delete1/:username",(req,res)=>{
       const username = req.params.username;
       con.query("delete from employee where username = ?",[username],(err,result)=>{
        if (err) {
          console.error("Error inserting data:", err);
          res.render("p.ejs",{message : "database0"});
       }
       res.redirect("/employeed");
})
});

app.get("/ledit/:codeno",(req,res)=>{
  const isLoggedIn = !!req.session.username;
  const codeno = req.params.codeno;
  if(req.session.username)
  {
      con.query("Select * from landlord where Codeno = ?",[codeno],(err,result)=>{
        if (err) {
          console.error("Error inserting data:", err);
          res.render("p.ejs",{message : "database0"});
       } 
       res.render("LandLordedit.ejs",{result: result, isLoggedIn, id : req.session.admin});
      });  
  }
  else
  {
    res.redirect("/");
  }
});

app.post("/ledit/:codeno", (req, res) => {
  const codeno = req.params.codeno;

  const {
    location,
    width,
    height,
    type,
    landlordname,
    sday,
    eday,
    rentamount,
    mcvtax,
  } = req.body;

  const sqlQuery = `
    UPDATE landlord
    SET Location = ?, Width = ?, Height = ?, Type = ?,  
        LandLord_Name = ?, Sday = ?, Eday = ?, Ramount = ?, MCVtax = ?
    WHERE Codeno = ?
  `;

  const values = [
    location,
    width,
    height,
    type,
    landlordname,
    sday,
    eday,
    rentamount,
    mcvtax,
    codeno, // Add Codeno as the last value
  ];

  con.query(sqlQuery, values, (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      res.redirect("/LandLordview");
    } else {
    
      res.redirect("/LandLordview");
    }
  });
});

app.get("/view",(req,res)=>{
  const isLoggedIn = !!req.session.username;

  if (isLoggedIn) {
    // User is logged in, render the secure page
    con.query("Select * from data",(err,results)=>{
  
      res.render("view.ejs",{result : results , isLoggedIn, id : req.session.admin});
    });
  } else {
    // User is not logged in, redirect to home page
    res.redirect('/'); 
  }
   
});

app.get("/sort1", (req, res) => {
  const isLoggedIn = !!req.session.username;
  const company = req.query.company; // Use req.query for GET parameters
  var query = "";
  if (company === "all") { // Use === for comparison, not =
    query = "SELECT * FROM data";
  } else {
    query = "SELECT * FROM data WHERE company = ?";
  }
  if (isLoggedIn) {
    // User is logged in, render the secure page
    con.query(query, [company], (err, results) => { // Use parameterized queries to prevent SQL injection
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      
      res.render("view.ejs", { result: results, isLoggedIn, id: req.session.admin , company : company});
    });
  } else {
    // User is not logged in, redirect to home page
    res.redirect('/');
  }
});

app.get("/LandLordview",(req,res)=>{
  const isLoggedIn = req.session.username;
  if(req.session.username)
  {
    con.query("Select * from landlord",(err,result)=>{
      if (err) {
        console.error("Error inserting data:", err);
        return res.render("p.ejs",{message : "database0"});
     }
     res.render("LandLordview.ejs",{isLoggedIn,id : req.session.admin, result});     
    });
  }
  else 
  {
    res.redirect("/");
  }
});

app.get("/notification", (req, res) => {
  const isLoggedIn = !!req.session.username;
  if (!isLoggedIn) {
    res.redirect("/");
    return; // Make sure to add a return statement here
  }
  const today = new Date();
  const sevenDaysFromToday = new Date(today);
  sevenDaysFromToday.setDate(sevenDaysFromToday.getDate() + 7);

  const todayFormatted = today.toISOString().split('T')[0];
  const sevennDaysFromTodayFormatted = sevenDaysFromToday.toISOString().split('T')[0];
  

  const query = `SELECT * FROM data WHERE Eday >= '${todayFormatted}' AND Eday <= '${sevennDaysFromTodayFormatted}'`;

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).send("Error retrieving data.");
    }
  
    res.render("notification.ejs", { data: results , isLoggedIn , id : req.session.admin});
  });
});

app.get("/sort2", (req, res) => {
  const isLoggedIn = !!req.session.username;
  const company = req.query.company; // Assuming the company parameter is sent through the query string
  
  if (!isLoggedIn) {
    return res.redirect("/");
  }

  const today = new Date();
  const sevenDaysFromToday = new Date(today);
  sevenDaysFromToday.setDate(sevenDaysFromToday.getDate() + 7);

  const todayFormatted = today.toISOString().split('T')[0];
  const sevenDaysFromTodayFormatted = sevenDaysFromToday.toISOString().split('T')[0];

  let query = "";
  if (company === "all") {
    query = `SELECT * FROM data WHERE Eday >= '${todayFormatted}' AND Eday <= '${sevenDaysFromTodayFormatted}'`;
  } else {
    query = `SELECT * FROM data WHERE Eday >= '${todayFormatted}' AND Eday <= '${sevenDaysFromTodayFormatted}' AND company = '${company}'`;
  }

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).send("Error retrieving data.");
    }
    
    res.render("notification.ejs", { data: results, isLoggedIn, id: req.session.admin , company : company });
  });
});



app.get("/expired", (req, res) => {
  const isLoggedIn = !!req.session.username;
  if (!isLoggedIn) {
    res.redirect("/");
    return; // Make sure to add a return statement here
  }
  const today = new Date();
  const tenDaysFromToday = new Date(today);
  tenDaysFromToday.setDate(tenDaysFromToday.getDate() + 10);

  const todayFormatted = today.toISOString().split('T')[0];
  const tenDaysFromTodayFormatted = tenDaysFromToday.toISOString().split('T')[0];

  const query = `SELECT * FROM data WHERE Eday <= '${todayFormatted}'`;

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).send("Error retrieving data.");
    }
    

    res.render("expired.ejs", { data: results, isLoggedIn , id : req.session.admin});
  });
});

app.get("/sort3", (req, res) => {
  const isLoggedIn = !!req.session.username;
  const company = req.query.company; 
  if (!isLoggedIn) {
    return res.redirect("/");
  }

  const today = new Date();
  const tenDaysFromToday = new Date(today);
  tenDaysFromToday.setDate(tenDaysFromToday.getDate() + 10);

  const todayFormatted = today.toISOString().split('T')[0];
  const tenDaysFromTodayFormatted = tenDaysFromToday.toISOString().split('T')[0];

  let query = "";
  if (company === "all") {
    query = `SELECT * FROM data WHERE Eday <= '${todayFormatted}'`;
  } else {
    query = `SELECT * FROM data WHERE Eday <= '${todayFormatted}' AND company = '${company}'`;
  }

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).send("Error retrieving data.");
    }
    

    res.render("expired.ejs", {company : company,data: results, isLoggedIn, id: req.session.admin });
  });
});


app.get("/LandlordExpired", (req, res) => {
  const isLoggedIn = !!req.session.username;
  if (!isLoggedIn) {
    res.redirect("/");
    return; // Make sure to add a return statement here
  }
  const today = new Date();
  const tenDaysFromToday = new Date(today);
  tenDaysFromToday.setDate(tenDaysFromToday.getDate() + 10);

  const todayFormatted = today.toISOString().split('T')[0];
  const tenDaysFromTodayFormatted = tenDaysFromToday.toISOString().split('T')[0];
  
  const query = `SELECT * FROM landlord WHERE Eday <= '${todayFormatted}'`;

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).send("Error retrieving data.");
    }
    
    
    res.render("LandlordExpired.ejs", { data: results, isLoggedIn , id : req.session.admin});
  });
});


app.get('/download7', async (req, res) => {
  try {

    const today = new Date();
    const tenDaysFromToday = new Date(today);
    tenDaysFromToday.setDate(tenDaysFromToday.getDate() + 10);
  
    const todayFormatted = today.toISOString().split('T')[0];
    const tenDaysFromTodayFormatted = tenDaysFromToday.toISOString().split('T')[0];
   
    const query = `SELECT * FROM landlord WHERE Eday <= '${todayFormatted}'`;

    con.query(query, async (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        return res.status(500).send("Error retrieving data.");
      }

      // Create an Excel sheet with retrieved data
      const worksheet = xlsx.utils.json_to_sheet(results);

    
      // Add the worksheet to a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Save Excel sheet to a buffer
      const excelBuffer = await xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      // Set response headers to force download
      res.setHeader('Content-Disposition', 'attachment; filename=Employee.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Send the generated Excel file for download
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error generating Excel file.");
  }
});


app.get("/img", (req, res) => {
  res.sendFile(__dirname + "/img1.jpg");
});

app.get('/map',(req,res)=>{
  const isLoggedIn = !!req.session.username;

  if (isLoggedIn) {
    // User is logged in, render the secure page
    res.render("maps.ejs", {isLoggedIn , id : req.session.admin, image : false});
  } else {
    // User is not logged in, redirect to home page
    res.redirect('/'); // Replace with your actual home page route
  }
  
});

app.get("/employee",(req,res)=>{
  const isLoggedIn = !!req.session.username;

  if (isLoggedIn) {
    // User is logged in, render the secure page
    res.render("employee.ejs", {isLoggedIn, id : req.session.admin});
  } else {
    // User is not logged in, redirect to home page
    res.redirect('/'); // Replace with your actual home page route
  }
});

app.post("/employee", (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists in the database
  con.query("SELECT * FROM employee WHERE username = ?", [username], (err, rows) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).send("Error retrieving data.");
    }
    if (rows.length > 0) {
      // Username already exists, render the template with an error message
      res.render("p.ejs", { message: 'Username already exists.' });
    }
    
    // If username is unique, insert into the database
    con.query("INSERT INTO employee VALUES (?, ?)", [username, password], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
       
      }
      res.redirect("/employee");
    });
  });
});


app.get('/logout', (req, res) => {
  const isLoggedIn = !!req.session.username;

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    } else {
      res.redirect('/');
    }
  });
});

app.get("/edit/:codeno", (req, res) => {
  const isLoggedIn = !!req.session.username;
  const codeno = req.params.codeno;

  if (isLoggedIn) {
    con.query("SELECT * FROM data WHERE id = ?", [codeno], (err, result) => {
      if (err) {
        console.error("Error fetching data for edit:", err);
        return res.status(500).send("Error fetching data for edit.");
      }
      res.render("edit.ejs", { result : result, isLoggedIn , id : req.session.admin});
    });
  } else {
    res.redirect('/'); // Replace with your actual home page route
  }
});


app.post("/edit/:id", upload.single('image'), (req, res) => {
  const codeno = req.params.id;
  console.log(codeno);
  const {
    location,
    width,
    height,
    type,
    media,
    longitude,
    latitude,
    display,
    client,
    sday,
    eday,
    landmark,
  } = req.body;

  // Check if an image was uploaded
  const image = req.file ? req.file.filename : undefined;

  const sqlQuery = `
    UPDATE data
    SET Location = ?, Width = ?, Height = ?, Type = ?, Media = ?, 
        Longitude = ?, Latitude = ?, display = ?, client = ?, Sday = ?, Eday = ?, Landmark = ?
        ${image ? ', image = ?' : ''}
    WHERE id = ?
  `;

  // Conditionally include image in values array
  const values = [
    location,
    width,
    height,
    type,
    media,
    longitude,
    latitude,
    display,
    client,
    sday,
    eday,
    landmark,
    ...(image ? [image] : []),
    codeno,
  ];

  con.query(sqlQuery, values, (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      res.status(500).send("Error updating data");
    } else {
      res.redirect("/view");
    }
  });
});

app.post("/edite/:codeno", upload.single('image'), (req, res) => {
  const codeno = req.params.codeno;
  const { display, client, sday, eday } = req.body;

  
  const sqlQuery = `
    UPDATE data
    SET display = ?, client = ?, Sday = ?, Eday = ?
    WHERE Codeno = ?; 
  `;

  const values = [display, client, sday, eday ,codeno];

  con.query(sqlQuery, values, (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      res.redirect("/view");
    } else {
    
      res.redirect("/view");
    }
  });
});



app.get("/map2", (req, res) => {
  const isLoggedIn = !!req.session.username;

  if (isLoggedIn) {
    con.query("SELECT Latitude, Longitude, image FROM data", (err, result) => {
      if (err) {
        console.error("Error querying data:", err);
        return res.status(500).send("Error fetching data");
      }
      
      const locations = result; 

      const defaultZoomLevel = 10; 

      res.render('maps2.ejs', {
        defaultZoomLevel: defaultZoomLevel,
        defaultLatitude : 52.5200 ,
        defaultLongitude: 13.4050,
        locations: locations,
        image: image,
        id: req.session.admin, 
        isLoggedIn: isLoggedIn ,
      });
    });
  } else {
    res.redirect("/"); // Corrected redirect syntax
  }
});

app.get("/map/:id",(req,res)=>{
  const isLoggedIn = !!req.session.username;
  const id = req.params.id;


  if (isLoggedIn) {
    con.query("SELECT Longitude, Latitude, image FROM data WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Error fetching data for edit:", err);
        return res.status(500).send("Error fetching data for edit.");
      }
      const longitude = result[0].Longitude; // Extract longitude from the result
      const latitude = result[0].Latitude;   // Extract latitude from the result

      const image = result[0].image;
     
      res.render("maps.ejs", { longitude, latitude, isLoggedIn, id : req.session.admin, image });
    });
  } else {
    res.redirect('/'); // Replace with your actual home page route
  }
});


app.get("/delete/:id",(req,res)=>{
  const isLoggedIn = !!req.session.username;
  const id = req.params.id;

  if (isLoggedIn) {
    con.query("delete FROM data WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Error fetching data for edit:", err);
        return res.status(500).send("Error fetching data for edit.");
      }
       // Extract latitude from the result
      res.redirect("/view");
    });
  } else {
    res.redirect('/'); // Replace with your actual home page route
  }
});

app.get("/ldelete/:codeno",(req,res)=>{
  const isLoggedIn = !!req.session.username;
  const codeno = req.params.codeno;

  if (isLoggedIn) {
    con.query("delete FROM landlord WHERE Codeno = ?", [codeno], (err, result) => {
      if (err) {
        console.error("Error fetching data for edit:", err);
        return res.status(500).send("Error fetching data for edit.");
      }
       // Extract latitude from the result
      res.redirect("/LandLordview");
    });
  } else {
    res.redirect('/'); // Replace with your actual home page route
  }
});

app.get("/test",(req,res)=>{
  const isLoggedIn = !!req.session.username; 
  if(isLoggedIn)
  {
    res.render("remarks.ejs",{isLoggedIn , id : req.session.admin , unallocatedRanges: false});
  }
});

app.get("/remarks2",(req,res)=>{
  const isLoggedIn = !!req.session.username; 
  if(isLoggedIn)
  {
    res.render("remarks2.ejs",{isLoggedIn , id : req.session.admin , unallocatedRanges: false});
  }
});

app.post("/remarks", (req, res) => {
  const isLoggedIn = !!req.session.username;
  const {year,month} = req.body;       
  if (isLoggedIn) {
    con.query("SELECT Codeno, Location, Sday, Eday FROM data", (err, results) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Function to increment a date by one day
      function incrementDateByOneDay(Sday) {
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
        const originalDate = new Date(Sday);
        const newDate = new Date(originalDate.getTime() + oneDayMilliseconds);
        return newDate.toISOString().split('T')[0];
      }

      // Function to decrement a date by one day
      function decrementDateByOneDay(Sday) {
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
        const originalDate = new Date(Sday);
        const newDate = new Date(originalDate.getTime() - oneDayMilliseconds);
        return newDate.toISOString().split('T')[0];
      }

      // Loop through the results and format date fields
      for (const entry of results) {
        const sdayDate = new Date(entry.Sday);
        const formattedSday = sdayDate.toISOString().split('T')[0];

        const edayDate = new Date(entry.Eday);
        const formattedEday = edayDate.toISOString().split('T')[0];

        entry.Sday = formattedSday;
        entry.Eday = formattedEday;
      }
    

      // Function to modify date ranges based on specific conditions
      function modify(year, month, results) {
        var start_date = new Date(year, month - 1, 1);
        start_date.setDate(start_date.getDate() + 1);
        start_date = start_date.toISOString().split('T')[0];
        var end_date = new Date(year, month, 1);
        end_date = end_date.toISOString().split('T')[0];
        var modified_results = [];
       
        
        for (const entry of results) {
 
      
          if (entry.Sday < start_date && entry.Eday > end_date) {
            continue;
          } else if (entry.Eday < start_date) {
            modified_results.push({
              id: 2,
              Codeno: entry.Codeno,
              Location: entry.Location,
              Sday: start_date,
              Eday: end_date
            });
          } else if (entry.Sday > start_date && entry.Eday < end_date) {
           
            modified_results.push({
              id: 1,
              Codeno: entry.Codeno,
              Location: entry.Location,
              Sday: start_date,
              Eday: entry.Sday
            });

            modified_results.push({
              id: 11,
              Codeno: entry.Codeno,
              Location: entry.Location,
              Sday: incrementDateByOneDay(incrementDateByOneDay(entry.Eday)),
              Eday: end_date
            });
          } else if (end_date < entry.Sday) {
            modified_results.push({
              id: 12,
              Codeno: entry.Codeno,
              Location: entry.Location,
              Sday: start_date,
              Eday: end_date
            });
                 
          } else if (entry.Sday > start_date && entry.Eday > end_date) {
            modified_results.push({
              id: 3,
              Codeno: entry.Codeno,
              Location: entry.Location,
              Sday: start_date,
              Eday: incrementDateByOneDay(entry.Sday)
            });
          }
        }
        return modified_results;
      }
     
      // Call the modify function and store the modified results
      const modifiedResults = modify(year, month, results);
     
      // Send the modified results as a response
      res.render("remarks.ejs",{unallocatedRanges : modifiedResults , isLoggedIn, id : req.session.admin});
    
    });
  } else {
    // Handle the case where the user is not logged in, e.g., send an error message or redirect to a login page
    res.status(401).send("Unauthorized: You must be logged in to access this resource.");
  }
    
});

app.get('/download/:company', async (req, res) => {
  try {
    // Retrieve data from the database
    const today = new Date();
    const tenDaysFromToday = new Date(today);
    tenDaysFromToday.setDate(tenDaysFromToday.getDate() + 10);

    const todayFormatted = today.toISOString().split('T')[0];
    const tenDaysFromTodayFormatted = tenDaysFromToday.toISOString().split('T')[0];
   
    const company = req.params.company;
    var query;
    if(company === "all")
    {
       query = `SELECT 
      Codeno, Location, Width, Height, Type, Media, Longitude, Latitude, display, 
      DATE_FORMAT(Sday, '%d-%m-%Y') AS Sday, DATE_FORMAT(Eday, '%d-%m-%Y') AS Eday, 
      Landmark, Image 
    FROM data 
    WHERE Eday <= '${todayFormatted}'`
    }
    else 
    {
       query = `SELECT 
      Codeno, Location, Width, Height, Type, Media, Longitude, Latitude, display, 
      DATE_FORMAT(Sday, '%d-%m-%Y') AS Sday, DATE_FORMAT(Eday, '%d-%m-%Y') AS Eday, 
      Landmark, Image 
    FROM data 
    WHERE Eday <= '${todayFormatted}' where company = '${company}'` 
    }
   

    

    con.query(query, async (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        return res.status(500).send("Error retrieving data.");
      }

      // Create an Excel sheet with retrieved data
      const worksheet = xlsx.utils.json_to_sheet(results);

      // Modify the rows to include absolute image links
      results.forEach((row, rowIndex) => {
        // Provide an absolute URL for the image link
        const imageUrl = `http://localhost:3000/uploads/${row.Image}`; // Assuming "Image" is the correct column name
        worksheet[`M${rowIndex + 2}`] = {
          t: "s",
          v: imageUrl,
          l: { Target: imageUrl, Tooltip: "Click to view image" },
        };
      });

      // Add the worksheet to a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Save Excel sheet to a buffer
      const excelBuffer = await xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      // Set response headers to force download
      res.setHeader('Content-Disposition', 'attachment; filename=download.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Send the generated Excel file for download
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error generating Excel file.");
  }
});

app.get('/download1/:company', async (req, res) => {
  try {
    // Retrieve data from the database
    const company = req.params.company;
    var query;
    if(company === "all")
    {
      query = `SELECT 
      Codeno, Location, Width, Height, Type, Media, Longitude, Latitude, display, 
      DATE_FORMAT(Sday, '%d-%m-%Y') AS Sday, DATE_FORMAT(Eday, '%d-%m-%Y') AS Eday, 
      Landmark, Image FROM data
    `;
    }
    else 
    {
      query = `SELECT 
      Codeno, Location, Width, Height, Type, Media, Longitude, Latitude, display, 
      DATE_FORMAT(Sday, '%d-%m-%Y') AS Sday, DATE_FORMAT(Eday, '%d-%m-%Y') AS Eday, 
      Landmark, Image 
    FROM data where company = '${company}'
    `;
    }
 
    con.query(query,async (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        return res.status(500).send("Error retrieving data.");
      }

      // Create an Excel sheet with retrieved data
      const worksheet = xlsx.utils.json_to_sheet(results);

      // Modify the rows to include absolute image links
      results.forEach((row, rowIndex) => {
        // Provide an absolute URL for the image link
        const imageUrl = `http://localhost:3000/uploads/${row.Image}`; // Assuming "Image" is the correct column name
        worksheet[`M${rowIndex + 2}`] = {
          t: "s",
          v: imageUrl,
          l: { Target: imageUrl, Tooltip: "Click to view image" },
        };
      });

      // Add the worksheet to a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Save Excel sheet to a buffer
      const excelBuffer = await xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      // Set response headers to force download
      res.setHeader('Content-Disposition', 'attachment; filename=view.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Send the generated Excel file for download
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error generating Excel file.");
  }
});

app.get('/download2/:company', async (req, res) => {
  try {
    // Retrieve data from the database, including image URLs or file paths
    const today = new Date();
    const sevenDaysFromToday = new Date(today);
    sevenDaysFromToday.setDate(sevenDaysFromToday.getDate() + 7);
  
    const todayFormatted = today.toISOString().split('T')[0];
    const sevennDaysFromTodayFormatted = sevenDaysFromToday.toISOString().split('T')[0];
  
    const company = req.params.company;
    var query;
    if(company === "all")
    {
      query = `SELECT 
      Codeno, Location, Width, Height, Type, Media, Longitude, Latitude, display, 
      DATE_FORMAT(Sday, '%d-%m-%Y') AS Sday, DATE_FORMAT(Eday, '%d-%m-%Y') AS Eday, 
      Landmark, Image FROM data WHERE  Eday >= '${todayFormatted}' AND Eday <= '${sevennDaysFromTodayFormatted}'
    `;
    }
    else 
    {
      query = `SELECT 
      Codeno, Location, Width, Height, Type, Media, Longitude, Latitude, display, 
      DATE_FORMAT(Sday, '%d-%m-%Y') AS Sday, DATE_FORMAT(Eday, '%d-%m-%Y') AS Eday, 
      Landmark, Image 
    FROM data where  Eday >= '${todayFormatted}' AND Eday <= '${sevennDaysFromTodayFormatted}' AND company = '${company}'
    `;
    }
   

    con.query(query, async (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        return res.status(500).send("Error retrieving data.");
      }

      // Create an Excel sheet with retrieved data
      const worksheet = xlsx.utils.json_to_sheet(results);

    
      // Add the worksheet to a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Save Excel sheet to a buffer
      const excelBuffer = await xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      // Set response headers to force download
      res.setHeader('Content-Disposition', 'attachment; filename=Employee.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Send the generated Excel file for download
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error generating Excel file.");
  }
});

app.get('/download3', async (req, res) => {
  try {
    // Retrieve data from the database
    const query = `SELECT 
      Codeno, Location, Width, Height, Type, LandLord_Name,
      DATE_FORMAT(Sday, '%d-%m-%Y') AS Sday, DATE_FORMAT(Eday, '%d-%m-%Y') AS Eday, 
      Ramount, MCVtax
    FROM landlord`;

    con.query(query, async (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        return res.status(500).send("Error retrieving data.");
      }

      // Create an Excel sheet with retrieved data
      const worksheet = xlsx.utils.json_to_sheet(results);

      // Format date columns (assuming your date columns are named "Sday" and "Eday")
     
      // Manually create the header row
      const headerRow = [
        'Codeno', 'Location', 'Width', 'Height', 'Type', 'LandLord_Name',
        'Sday', 'Eday', 'Ramount', 'MCVtax'
      ];

      // Insert the header row at the beginning of the worksheet
      xlsx.utils.sheet_add_aoa(worksheet, [headerRow], { origin: 'A1' });

      // Add the worksheet to a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Save Excel sheet to a buffer
      const excelBuffer = await xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      // Set response headers to force download
      res.setHeader('Content-Disposition', 'attachment; filename=LandLord.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Send the generated Excel file for download
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error generating Excel file.");
  }
});

app.get("/m22",(req,res)=>{
  res.render("m22.ejs");
});

app.get("/test",(req,res)=>{
  const isLoggedIn = !!req.session.username; 
  if(isLoggedIn)
  {
    res.render("test.ejs",{isLoggedIn , id : req.session.admin , unallocatedRanges: false});
  }
});


app.post("/test", (req, res) => {
  const isLoggedIn = !!req.session.username;
const { year, month, company } = req.body;
var query;

if (company === "all") {
  query = "SELECT Codeno, Location, client, Sday, Eday FROM data";
} else {
  query = `SELECT Codeno, Location, client, Sday, Eday FROM data WHERE company = '${company}'`;
  
}

  if (isLoggedIn) {
    con.query(query, (err, results) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
    
      function incrementDateByOneDay(Sday) {
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
        const originalDate = new Date(Sday);
        const newDate = new Date(originalDate.getTime() + oneDayMilliseconds);
        return newDate.toISOString().split('T')[0];
      }
      
      
      for (const entry of results) {
        const sdayDate = new Date(entry.Sday);
        const formattedSday = sdayDate.toISOString().split('T')[0];

        const edayDate = new Date(entry.Eday);
        const formattedEday = edayDate.toISOString().split('T')[0];

        entry.Sday = formattedSday;
        entry.Eday = formattedEday;
      }
    
 

      // Create an object to store grouped data
      const groupedData = {};

      // Iterate through the query results
      results.forEach((row) => {
        var { Codeno, Location,client,Sday, Eday } = row;
        
        Sday = incrementDateByOneDay(Sday);
        Eday = incrementDateByOneDay(Eday);
         
        // Check if the Codeno already exists in the groupedData object
        if (!groupedData[Codeno]) {
          // If it doesn't exist, create an empty array for the Codeno
          groupedData[Codeno] = [];
        }
        
        // Push the row data into the corresponding Codeno group
        groupedData[Codeno].push({ Location,client,Sday, Eday });
      });

    
      var start_date = new Date(year, month - 1, 1);
      start_date.setDate(start_date.getDate() + 1);
      start_date = start_date.toISOString().split('T')[0];
      var end_date = new Date(year, month, 1);
      end_date = end_date.toISOString().split('T')[0];
  
      // Function to decrement a date by one day
      function decrementDateByOneDay(Sday) {
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
        const originalDate = new Date(Sday);
        const newDate = new Date(originalDate.getTime() - oneDayMilliseconds);
        return newDate.toISOString().split('T')[0];
      }

      

 
      const modified_results = [];
  var i = 0;
  for(const Codeno in groupedData )
  {
    const entries = groupedData[Codeno];
    
    var n = entries.length;
  
     if(start_date >= entries[0].Eday && end_date >= entries[0].Sday)
      {
        continue;
      }
      else if(entries[0].Sday <= start_date && end_date <= entries[0].Eday)
      {
       continue;
      }
      else if(start_date < entries[0].Sday && entries[0].Eday < end_date)
      {
        modified_results.push(
          {
           id   : 6,
           codeno : Codeno,
           location: entries[0].Location,
           client  :  entries[0].client,
            Sday: start_date,
            Eday: decrementDateByOneDay(entries[0].Sday)
          }
       );
       modified_results.push(
        {
         id   : 7,
         codeno : Codeno,
         location: entries[0].Location,
         client  :  entries[0].client,
          Sday: incrementDateByOneDay(entries[0].Eday),
          Eday: end_date
        }
     );
      }
      else if(start_date < entries[0].Sday)
      {
       modified_results.push(
          {
           id   : 1,
           codeno : Codeno,
           location: entries[0].Location,
           client  :  entries[0].client,
            Sday: start_date,
            Eday: decrementDateByOneDay(entries[0].Sday)
          }
       );
      }
      else if(start_date < entries[0].Sday)
      {
       modified_results.push(
          {
           id   : 1,
           codeno : Codeno,
           location: entries[0].Location,
           client  :  entries[0].client,
            Sday: start_date,
            Eday: decrementDateByOneDay(entries[0].Sday)
          }
       );
      }
      else if(start_date >= entries[0].Sday && n > 1)
      {
        modified_results.push({
           id : 2,
           codeno : Codeno,
           location:entries[0].Location,
           client  :  entries[0].client,
           Sday: incrementDateByOneDay(entries[0].Eday),
           Eday: decrementDateByOneDay(entries[1].Sday)
        });
      }
      else if(start_date >= entries[0].Sday && n === 1)
      {
        modified_results.push({
          
          id    : 3,
           codeno : Codeno,
           location:entries[0].Location,
           client  :  entries[0].client,
           Sday: incrementDateByOneDay(entries[0].Eday),
           Eday: end_date
        });
      }
      
      
  
    if(n > 1)
    {
  
    
    for(var i = 1 ; i <= n-1 ; i+=1)
    {  
      if(entries[i].Sday > end_date)
      {
        continue;
      }
      else 
      {
      
        modified_results.push({
          id  : 4,
          codeno : Codeno,
          location:entries[0].Location,
          client: entries[0].client,
          Sday: incrementDateByOneDay(entries[i-1].Eday),
          Eday: decrementDateByOneDay(entries[i].Sday)
        });
      }
     
    }

  }
  if(start_date > entries[n-1].Eday && end_date > entries[n-1].Sday && n > 1)
      {
        continue;
      }
  else if(entries[n-1].Eday <= end_date && n > 1)
  {
    modified_results.push({
      id  : 5,
      codeno : Codeno,
      location:entries[0].Location,
      client: entries[0].client,
      Sday: incrementDateByOneDay(entries[n-1].Eday),
      Eday: end_date
   });
  }
  else if(entries[n-1].Eday >= end_date && n > 1)
  continue;
 
}
  
      console.log(modified_results);  
      res.render("remarks.ejs",{unallocatedRanges : modified_results , isLoggedIn, id : req.session.admin});
    
    });
  } else {
    // Handle the case where the user is not logged in, e.g., send an error message or redirect to a login page
    res.status(401).send("Unauthorized: You must be logged in to access this resource.");
  }
    
});

app.post("/remarks2", (req, res) => {
  const isLoggedIn = !!req.session.username;
const year1 = req.body.year;
const company = req.body.company;
var query;

if (company === "all") {
  query = "SELECT Codeno, Location, client, Sday, Eday FROM data";
} else {
  query = `SELECT Codeno, Location, client, Sday, Eday FROM data WHERE company = '${company}'`;
  
}

  if (isLoggedIn) {
    con.query(query, (err, results) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
     
      function incrementDateByOneDay(Sday) {
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
        const originalDate = new Date(Sday);
        const newDate = new Date(originalDate.getTime() + oneDayMilliseconds);
        return newDate.toISOString().split('T')[0];
      }
      
      
      for (const entry of results) {
        const sdayDate = new Date(entry.Sday);
        const formattedSday = sdayDate.toISOString().split('T')[0];

        const edayDate = new Date(entry.Eday);
        const formattedEday = edayDate.toISOString().split('T')[0];

        entry.Sday = formattedSday;
        entry.Eday = formattedEday;
      }
    
 

      // Create an object to store grouped data
      const groupedData = {};

      // Iterate through the query results
      results.forEach((row) => {
        var { Codeno, Location,client,Sday, Eday } = row;
        
        Sday = incrementDateByOneDay(Sday);
        Eday = incrementDateByOneDay(Eday);
         
        // Check if the Codeno already exists in the groupedData object
        if (!groupedData[Codeno]) {
          // If it doesn't exist, create an empty array for the Codeno
          groupedData[Codeno] = [];
        }
        
        // Push the row data into the corresponding Codeno group
        groupedData[Codeno].push({ Location,client,Sday, Eday });
      });

      // Now, groupedData contains data grouped by Codeno
   
      var year = year1; // Replace this with the desired year
      var start_date = new Date(year, 0, 1); // January is represented by 0
      start_date = start_date.toISOString().split('T')[0];
      var end_date = new Date(year, 11, 31); // December is represented by 11
      end_date = end_date.toISOString().split('T')[0];
      
      start_date = incrementDateByOneDay(start_date);
      end_date = incrementDateByOneDay(end_date);
      
      // Function to decrement a date by one day
      function decrementDateByOneDay(Sday) {
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
        const originalDate = new Date(Sday);
        const newDate = new Date(originalDate.getTime() - oneDayMilliseconds);
        return newDate.toISOString().split('T')[0];
      }

    

      // Send the modified results as a response
     
      const modified_results = [];
  var i = 0;
  for(const Codeno in groupedData )
  {
    const entries = groupedData[Codeno];
    
    var n = entries.length;
  
     if(start_date >= entries[0].Eday && end_date >= entries[0].Sday)
      {
        continue;
      }
      else if(entries[0].Sday <= start_date && end_date <= entries[0].Eday)
      {
       continue;
      }
      else if(start_date < entries[0].Sday && entries[0].Eday < end_date)
      {
        modified_results.push(
          {
           id   : 6,
           codeno : Codeno,
           location: entries[0].Location,
           client  :  entries[0].client,
            Sday: start_date,
            Eday: decrementDateByOneDay(entries[0].Sday)
          }
       );
       modified_results.push(
        {
         id   : 7,
         codeno : Codeno,
         location: entries[0].Location,
         client  :  entries[0].client,
          Sday: incrementDateByOneDay(entries[0].Eday),
          Eday: end_date
        }
     );
      }
      else if(start_date < entries[0].Sday)
      {
       modified_results.push(
          {
           id   : 1,
           codeno : Codeno,
           location: entries[0].Location,
           client  :  entries[0].client,
            Sday: start_date,
            Eday: decrementDateByOneDay(entries[0].Sday)
          }
       );
      }
      else if(start_date >= entries[0].Sday && n > 1)
      {
        modified_results.push({
           id : 2,
           codeno : Codeno,
           location:entries[0].Location,
           client  :  entries[0].client,
           Sday: incrementDateByOneDay(entries[0].Eday),
           Eday: decrementDateByOneDay(entries[1].Sday)
        });
      }
      else if(start_date >= entries[0].Sday && n === 1)
      {
        modified_results.push({
          
          id    : 3,
           codeno : Codeno,
           location:entries[0].Location,
           client  :  entries[0].client,
           Sday: incrementDateByOneDay(entries[0].Eday),
           Eday: end_date
        });
      }
      
      
  
    if(n > 1)
    {
  
    
    for(var i = 1 ; i <= n-1 ; i+=1)
    {  
      if(entries[i].Sday > end_date)
      {
        continue;
      }
      else 
      {
      
        modified_results.push({
          id  : 4,
          codeno : Codeno,
          location:entries[0].Location,
          client: entries[0].client,
          Sday: incrementDateByOneDay(entries[i-1].Eday),
          Eday: decrementDateByOneDay(entries[i].Sday)
        });
      }
     
    }

  }
  if(start_date > entries[n-1].Eday && end_date > entries[n-1].Sday && n > 1)
      {
        continue;
      }
  else if(entries[n-1].Eday <= end_date && n > 1)
  {
    modified_results.push({
      id  : 5,
      codeno : Codeno,
      location:entries[0].Location,
      client: entries[0].client,
      Sday: incrementDateByOneDay(entries[n-1].Eday),
      Eday: end_date
   });
  }
  else if(entries[n-1].Eday >= end_date && n > 1)
  continue;
 
}
  
      res.render("remarks2.ejs",{unallocatedRanges : modified_results , isLoggedIn, id : req.session.admin});
    
    });
  } else {
    // Handle the case where the user is not logged in, e.g., send an error message or redirect to a login page
    res.status(401).send("Unauthorized: You must be logged in to access this resource.");
  }
    
});

app.get("/test2",(req,res)=>{

  const year = 2023; // Replace with the desired year
  const month = 9;   // Replace with the desired month (1-12)
  var start_date = new Date(year, month - 1, 1);
  start_date.setDate(start_date.getDate() + 1);
  start_date = start_date.toISOString().split('T')[0];
  var end_date = new Date(year, month, 1);
  end_date = end_date.toISOString().split('T')[0];
 
  const groupedData = {
    '1': [
      { Location: 'London', Sday: '2023-09-06', Eday: '2023-09-15' },
      { Location: 'London', Sday: '2023-09-26', Eday: '2023-09-29' },
      { Location: 'London', Sday: '2022-09-26', Eday: '2022-09-29' }
    ],
    '2': [ { Location: 'Germany', Sday: '2023-09-08', Eday: '2023-09-14' } ]
  };
   


  const modified_results = [];
  var i = 0;
  for(const Codeno in groupedData )
  {
    const entries = groupedData[Codeno];
    
    var n = entries.length;
  
      if(start_date > entries[0].Eday && end_date > entries[0].Sday)
      {
        continue;
      }
      else if(start_date < entries[0].Sday)
      {
       modified_results.push(
          {
           codeno : Codeno,
           location: entries[0].Location,
            Sday: start_date,
            Eday: entries[0].Sday
          }
       );
      }
      else if(start_date > entries[0].Sday && n > 1)
      {
        modified_results.push({
           codeno : Codeno,
           location:entries[0].Location,
           Sday: entries[0].Eday,
           Eday: entries[1].Sday
        });
      }
      else if(start_date > entries[0].Sday && n === 1)
      {
        modified_results.push({
           codeno : Codeno,
           location:entries[0].Location,
           Sday: entries[0].Eday,
           Eday: end_date
        });
      }
      
    
    if(n > 1)
    {
    
    
    for(var i = 1 ; i <= n-1 ; i+=1)
    {  
      if(start_date > entries[i].Eday && end_date > entries[i].Sday)
      {
        continue;
      }
      else 
      {
        
        modified_results.push({
          codeno : Codeno,
          Location:entries[0].Location,
          Sday: entries[i-1].Eday,
          Eday:entries[i].Sday
        });
      }
     
    }

  }
  if(start_date > entries[n-1].Eday && end_date > entries[n-1].Sday)
      {
        continue;
      }
  else if(entries[n-1].Eday < end_date)
  {
    modified_results.push({
      Codeno : Codeno,
      Location:entries[0].Location,
      Sday: entries[n-1].Eday,
      Eday: end_date
   });
  }
  else if(entries[n-1].Eday > end_date)
  continue;
 
}

  
res.send("hiii");
});

app.get("/remarks3",(req,res)=>{
  const isLoggedIn = !!req.session.username; 
  if(isLoggedIn)
  {
    res.render("remarks3.ejs",{isLoggedIn , id : req.session.admin , unallocatedRanges: false});
  }
});

app.get("/occupied",(req,res)=>{
  const isLoggedIn = !!req.session.username; 
  if(isLoggedIn)
  {
    res.render("occupied.ejs",{isLoggedIn , id : req.session.admin , unallocatedRanges: false});
  }
});


app.post("/occupied", (req, res) => {
  const isLoggedIn = !!req.session.username;
  const codeno = req.body.codeno;
  const company = req.body.company;
  const year = req.body.year;
  
  let query;


  if (company === "all") {
    query = `SELECT Codeno, Location, client, Sday, Eday FROM data WHERE Codeno = '${codeno}' AND (YEAR(Sday) = ${year} OR YEAR(Eday) = ${year})`;
  } else {
    query = `SELECT Codeno, Location, client, Sday, Eday FROM data WHERE company = '${company}' AND Codeno = '${codeno}' AND (YEAR(Sday) = ${year} OR YEAR(Eday) = ${year})`;
  }

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error fetching data");
    } else {
      
      res.render("occupied.ejs", { unallocatedRanges: results, isLoggedIn, id: req.session.admin });
    }
  });
});


app.post("/remarks3", (req, res) => {
  const isLoggedIn = !!req.session.username;
  const Day1 = new Date(req.body.sday); 
  const Day2 = new Date(req.body.eday);
  console.log(Day1);
  console.log(Day2);

  const company = req.body.company;
  if (company === "all") {
    query = "SELECT Codeno, Location, client, Sday, Eday FROM data";
  } else {
    query = `SELECT Codeno, Location, client, Sday, Eday FROM data WHERE company = '${company}'`;  
  }
  
  if (isLoggedIn) {
    con.query(query, (err, results) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
    
 
     
      function incrementDateByOneDay(Sday) {
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
        const originalDate = new Date(Sday);
        const newDate = new Date(originalDate.getTime() + oneDayMilliseconds);
        return newDate.toISOString().split('T')[0];
      }
      
      
      for (const entry of results) {
        const sdayDate = new Date(entry.Sday);
        const formattedSday = sdayDate.toISOString().split('T')[0];

        const edayDate = new Date(entry.Eday);
        const formattedEday = edayDate.toISOString().split('T')[0];

        entry.Sday = formattedSday;
        entry.Eday = formattedEday;
      }
    
 

      // Create an object to store grouped data
      const groupedData = {};

      // Iterate through the query results
      results.forEach((row) => {
        var { Codeno, Location,client,Sday, Eday } = row;

        Sday = incrementDateByOneDay(Sday);
        Eday = incrementDateByOneDay(Eday);
         
        // Check if the Codeno already exists in the groupedData object
        if (!groupedData[Codeno]) {
          // If it doesn't exist, create an empty array for the Codeno
          groupedData[Codeno] = [];
        }
        
        // Push the row data into the corresponding Codeno group
        groupedData[Codeno].push({ Location,client,Sday, Eday });
      });

      // Now, groupedData contains data grouped by Codeno
      var start_date = Day1; // January is represented by 0
      start_date = start_date.toISOString().split('T')[0];
      console.log(start_date);
      var end_date = Day2; // December is represented by 11
      end_date = end_date.toISOString().split('T')[0];
      console.log(end_date); 
      
      
      // Function to decrement a date by one day
      function decrementDateByOneDay(Sday) {
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
        const originalDate = new Date(Sday);
        const newDate = new Date(originalDate.getTime() - oneDayMilliseconds);
        return newDate.toISOString().split('T')[0];
      }

    

   
      const modified_results = [];
  var i = 0;
  for(const Codeno in groupedData )
  {
    const entries = groupedData[Codeno];
    
    var n = entries.length;
  
     if(start_date >= entries[0].Eday && end_date >= entries[0].Sday)
      {
        continue;
      }
      else if(entries[0].Sday <= start_date && end_date <= entries[0].Eday)
      {
       continue;
      }
      else if(start_date < entries[0].Sday && entries[0].Eday < end_date)
      {
        modified_results.push(
          {
           id   : 6,
           codeno : Codeno,
           location: entries[0].Location,
           client  :  entries[0].client,
            Sday: start_date,
            Eday: decrementDateByOneDay(entries[0].Sday)
          }
       );
       modified_results.push(
        {
         id   : 7,
         codeno : Codeno,
         location: entries[0].Location,
         client  :  entries[0].client,
          Sday: incrementDateByOneDay(entries[0].Eday),
          Eday: end_date
        }
     );
      }
      else if(start_date < entries[0].Sday)
      {
       modified_results.push(
          {
           id   : 1,
           codeno : Codeno,
           location: entries[0].Location,
           client  :  entries[0].client,
            Sday: start_date,
            Eday: decrementDateByOneDay(entries[0].Sday)
          }
       );
      }
      else if(start_date >= entries[0].Sday && n > 1)
      {
        modified_results.push({
           id : 2,
           codeno : Codeno,
           location:entries[0].Location,
           client  :  entries[0].client,
           Sday: incrementDateByOneDay(entries[0].Eday),
           Eday: decrementDateByOneDay(entries[1].Sday)
        });
      }
      else if(start_date >= entries[0].Sday && n === 1)
      {
        modified_results.push({
          
          id    : 3,
           codeno : Codeno,
           location:entries[0].Location,
           client  :  entries[0].client,
           Sday: incrementDateByOneDay(entries[0].Eday),
           Eday: end_date
        });
      }
      
      
  
    if(n > 1)
    {
  
    
    for(var i = 1 ; i <= n-1 ; i+=1)
    {  
      if(entries[i].Sday > end_date)
      {
        continue;
      }
      else 
      {
      
        modified_results.push({
          id  : 4,
          codeno : Codeno,
          location:entries[0].Location,
          client: entries[0].client,
          Sday: incrementDateByOneDay(entries[i-1].Eday),
          Eday: decrementDateByOneDay(entries[i].Sday)
        });
      }
     
    }

  }
  if(start_date > entries[n-1].Eday && end_date > entries[n-1].Sday && n > 1)
      {
        continue;
      }
  else if(entries[n-1].Eday <= end_date && n > 1)
  {
    modified_results.push({
      id  : 5,
      codeno : Codeno,
      location:entries[0].Location,
      client: entries[0].client,
      Sday: incrementDateByOneDay(entries[n-1].Eday),
      Eday: end_date
   });
  }
  else if(entries[n-1].Eday >= end_date && n > 1)
  continue;
 
}
 
 
  
      res.render("remarks3.ejs",{unallocatedRanges : modified_results , isLoggedIn, id : req.session.admin});
    
    });
  } else {
    // Handle the case where the user is not logged in, e.g., send an error message or redirect to a login page
    res.status(401).send("Unauthorized: You must be logged in to access this resource.");
  }
    
});

app.get('/download4', (req, res) => {
  // Retrieve the unallocatedRanges data from the query parameter 'data'
  const unallocatedRangesData = req.query.data;

  if (unallocatedRangesData) {
    try {
      // Parse the JSON string back into an array
      const unallocatedRanges = JSON.parse(decodeURIComponent(unallocatedRangesData));

      // Create a new worksheet
      const worksheet = xlsx.utils.json_to_sheet([]);

      // Add header row to the worksheet
      xlsx.utils.sheet_add_json(worksheet, [
        { Codeno: 'Codeno', Location: 'Location',client : 'client','Start Date': 'Start Date', 'End Date': 'End Date' }
      ], { skipHeader: true, origin: 'A1' });

      // Add data rows to the worksheet
      xlsx.utils.sheet_add_json(worksheet, unallocatedRanges, { skipHeader: true, origin: 'A2' });

      // Create a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Unallocated Ranges');

      // Write the Excel file to the response
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      
      // Set content type and headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=unallocated_ranges.xlsx');

      // Send the Excel file as a buffer
      res.end(excelBuffer);
    } catch (error) {
      console.error('Error parsing unallocatedRanges data:', error);
      res.status(500).send('Error processing unallocatedRanges data');
    }
  } else {
    res.status(400).send('Missing unallocatedRanges data');
  }
});

app.get('/download5', (req, res) => {
  // Retrieve the unallocatedRanges data from the query parameter 'data'
  const unallocatedRangesData = req.query.data;

  if (unallocatedRangesData) {
    try {
      // Parse the JSON string back into an array
      const unallocatedRanges = JSON.parse(decodeURIComponent(unallocatedRangesData));

      // Create a new worksheet
      const worksheet = xlsx.utils.json_to_sheet([]);

      // Add header row to the worksheet
      xlsx.utils.sheet_add_json(worksheet, [
        { Codeno: 'Codeno', Location: 'Location',client : "client",'Start Date': 'Start Date', 'End Date': 'End Date' }
      ], { skipHeader: true, origin: 'A1' });

      // Add data rows to the worksheet
      xlsx.utils.sheet_add_json(worksheet, unallocatedRanges, { skipHeader: true, origin: 'A2' });

      // Create a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Unallocated Ranges');

      // Write the Excel file to the response
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      
      // Set content type and headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=unallocated_ranges.xlsx');

      // Send the Excel file as a buffer
      res.end(excelBuffer);
    } catch (error) {
      console.error('Error parsing unallocatedRanges data:', error);
      res.status(500).send('Error processing unallocatedRanges data');
    }
  } else {
    res.status(400).send('Missing unallocatedRanges data');
  }
});

app.get('/download6', (req, res) => {
  // Retrieve the unallocatedRanges data from the query parameter 'data'
  const unallocatedRangesData = req.query.data;



  if (unallocatedRangesData) {
    try {
      // Parse the JSON string back into an array
      const unallocatedRanges = JSON.parse(decodeURIComponent(unallocatedRangesData));

      // Create a new worksheet
      const worksheet = xlsx.utils.json_to_sheet([]);

      // Add header row to the worksheet
      xlsx.utils.sheet_add_json(worksheet, [
        { Codeno: 'Codeno', Location: 'Location',client : 'client','Start Date': 'Start Date', 'End Date': 'End Date' }
      ], { skipHeader: true, origin: 'A1' });

      // Add data rows to the worksheet
      xlsx.utils.sheet_add_json(worksheet, unallocatedRanges, { skipHeader: true, origin: 'A2' });

      // Create a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Unallocated Ranges');

      // Write the Excel file to the response
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      
      // Set content type and headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=unallocated_ranges.xlsx');

      // Send the Excel file as a buffer
      res.end(excelBuffer);
    } catch (error) {
      console.error('Error parsing unallocatedRanges data:', error);
      res.status(500).send('Error processing unallocatedRanges data');
    }
  } else {
    res.status(400).send('Missing unallocatedRanges data');
  }
});


app.get('/download7', async (req, res) => {
  try {

    const today = new Date();
    const tenDaysFromToday = new Date(today);
    tenDaysFromToday.setDate(tenDaysFromToday.getDate() + 10);
  
    const todayFormatted = today.toISOString().split('T')[0];
    const tenDaysFromTodayFormatted = tenDaysFromToday.toISOString().split('T')[0];
 
    const query = `SELECT * FROM landlord WHERE Eday <= '${todayFormatted}'`;

    con.query(query, async (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        return res.status(500).send("Error retrieving data.");
      }

      // Create an Excel sheet with retrieved data
      const worksheet = xlsx.utils.json_to_sheet(results);

    
      // Add the worksheet to a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Save Excel sheet to a buffer
      const excelBuffer = await xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      // Set response headers to force download
      res.setHeader('Content-Disposition', 'attachment; filename=Employee.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Send the generated Excel file for download
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error generating Excel file.");
  }
});

app.get('/download8', async (req, res) => {
  try {
   
    const today = new Date();
    const tenDaysFromToday = new Date(today);
    tenDaysFromToday.setDate(tenDaysFromToday.getDate() + 15);
  
    const todayFormatted = today.toISOString().split('T')[0];
    const tenDaysFromTodayFormatted = tenDaysFromToday.toISOString().split('T')[0];
  
  
    const query = `SELECT * FROM landlord WHERE Eday >= '${todayFormatted}' AND Eday <= '${tenDaysFromTodayFormatted}'`;

    con.query(query, async (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        return res.status(500).send("Error retrieving data.");
      }

      // Create an Excel sheet with retrieved data
      const worksheet = xlsx.utils.json_to_sheet(results);

    
      // Add the worksheet to a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Save Excel sheet to a buffer
      const excelBuffer = await xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      // Set response headers to force download
      res.setHeader('Content-Disposition', 'attachment; filename=Employee.xlsx');
      res.setHeader('Content-Type', 'aplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Send the generated Excel file for download
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Error generating Excel file.");
  }
});
app.get('/download9', (req, res) => {
  // Retrieve the unallocatedRanges data from the query parameter 'data'
  const unallocatedRangesData = req.query.data;

  if (unallocatedRangesData) {
    try {
      // Parse the JSON string back into an array
      const unallocatedRanges = JSON.parse(decodeURIComponent(unallocatedRangesData));

      // Modify 'Start Date' and 'End Date' fields to only include dates in the original array
      unallocatedRanges.forEach(range => {
        range['Sday'] = range['Sday'].substr(0, 10); // Keep only the date part for 'Sday'
        range['Eday'] = range['Eday'].substr(0, 10); // Keep only the date part for 'Eday'
      });

      // Create a new worksheet
      const worksheet = xlsx.utils.json_to_sheet([]);

      // Add header row to the worksheet
      xlsx.utils.sheet_add_json(worksheet, [
        { Codeno: 'Codeno', Location: 'Location', client: 'client', 'Start Date': 'Sday', 'End Date': 'Eday' }
      ], { skipHeader: true, origin: 'A1' });

      // Add data rows to the worksheet
      xlsx.utils.sheet_add_json(worksheet, unallocatedRanges, { skipHeader: true, origin: 'A2' });

      // Create a new workbook
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Unallocated Ranges');

      // Write the Excel file to the response
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      // Set content type and headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=unallocated_ranges.xlsx');

      // Send the Excel file as a buffer
      res.end(excelBuffer);
    } catch (error) {
      console.error('Error parsing unallocatedRanges data:', error);
      res.status(500).send('Error processing unallocatedRanges data');
    }
  } else {
    res.status(400).send('Missing unallocatedRanges data');
  }
});


const port = 3000;

app.listen(port,() => {
  console.log(`Server is running on ${port}`);
});

