db.createUser({
  user: 'tanmay',
  pwd: '7825tanmay',
  roles: [
    {
      role: 'readWrite',
      db: 'passport-app'
    }
  ]
})