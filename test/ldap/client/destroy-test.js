var should = require('should')
var Store = require('../../../lib/store')

describe('LDAP Client: Destroy', function(){
  var store

  before(function(){
    store = new Store({
      type: 'ldap',
      url: 'ldap://0.0.0.0:1389',
      base: 'dc=test',
      user: 'cn=root',
      password: 'secret',
      autoSave: true
    })

    store.Model('User', function(){
      this.attribute('username', String)
      this.attribute('memberOf', 'dn_array')

      this.hasParent('ou')
      this.hasMany('groups', {container: 'children', to: 'member'})
    })

    store.Model('Group', function(){
      this.attribute('name', String)
      this.attribute('member', 'dn_array')

      this.hasParent('ou')
      this.belongsToMany('members', {from: 'member'})
    })

    store.Model('Ou', function(){
      this.isContainer('ou')
      this.attribute('name', String)
    })
  })



  it('destroys a single record', function(){
    return store.ready(function(){
      var User = store.Model('User')

      return User.find('cn=destroy_me, ou=destroy, dc=test').exec(function(user){
        user.username.should.be.equal('destroy_me')

        return user.destroy(function(){
          return User.find('cn=destroy_me, ou=destroy, dc=test').exec(function(user){
            should.not.exists(user)
          })
        })
      })
    })
  })
})
