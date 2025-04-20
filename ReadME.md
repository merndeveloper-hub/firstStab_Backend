    
1) User Signup
http://localhost:5000/api/v1/auth/register/user

2) Pro Signup
http://localhost:5000/api/v1/auth/register/pro

3) User and Pro login
http://localhost:5000/api/v1/auth/userlogin

4) User and Pro logOut
id ==> token document user id
http://localhost:5000/api/v1/auth//logout/:id

5) User and Pro Forget Password
http://localhost:5000/api/v1/auth/forgetpassword

6) User and Pro Send OTP (
//----------User and Pro forgot Password Send OTP--------------------//)
http://localhost:5000/api/v1/auth/sendotp

7) User and Pro Verify OTP
http://localhost:5000/api/v1/auth/verifyotp

8) User and Pro ReSend OTP
http://localhost:5000/api/v1/auth/resendotp



http://localhost:5000/api/v1/pro/home ==> update dekhnii hian kl

backend server ip ==> http://3.110.42.187:5000

db error ==> 401
vadioaion error ==> 400
catch ==> 400
success == >200
created ==> 200


///ask the theo/////
jb a=hum koi service lete hai is mein end time nhi btate ktni derh ke service pro de ga inchat,virtual,inperson

booking
bookingRatings
bookingQuotes
bookingPayment
bookingStatus
bookingTimeline

Request Sent,Cancelled By Customer,Confirmed by Customer,Cancelled By Professional

////////ER DIAGRAM///
https://dbdiagram.io/d


user ==>book service ==> Pending ==>  
pro ==>get service ==> Pending ==>


one to many


login pro ==>get service ==> Pending==>    

login user ==>get service ==> Pending ==>

pro accept ==> Accepted

user get quote ==> proBookservices Accpeted

user confirm booking service ==>  proBookservices and userBookService ==> onGoing
   