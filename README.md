# SecretClub
A simple exclusive clubhouse where your members can write anonymous posts.  Inside the clubhouse, members can see who the author of a post is, but outside  they can only see the story and wonder who wrote it.
Clubhouse is secured with a securitykey to identify member of clubhouse. Only those members who knows the secret key can access the secret club.

Demo
https://drive.google.com/file/d/17MuY8qhY6TFzU6NCFcAbQfPWu4M3HahT/view


## Setup
- Clone this Repository with `git clone`
- Create a .env file in the root folder with the following variables : `PORT`, `SECRET`, `SECRETKEY`, `DATABASE_URL`.
```
//example of .env
// change the values accordingly 
DATABASE_URL="postgresql://dfsasdf@localhost:5432/sdfafds?schema=public"
SECRET="dfljsafjalfjasldjfasdlfj"
SECRETKEY="2343"
PORT="5323"
```
- Run `npm run setup` for install Required Packages and Setting up database.
- Run your Backend with `npm run start`


## Help 
- For any help Reach out to me on discord @mdi38
