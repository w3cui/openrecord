var path = require('path')
const Store = require('../../../store/sqlite3')
const cache = require('../../fixtures/cache/sqlite3.json')

describe('SQLite3: Cache', function(){
  var store
  var database = path.join(__dirname, 'cache_test.sqlite3')


  function withoutChanged(attr){
    const a = Object.assign({}, attr)
    a.name = a.name.replace('_changed', '')
    return a
  }


  before(function(next){
    this.timeout(5000)
    beforeSQLite(database, [
      'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT)',
      'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)'
    ], next)
  })

  before(function(){
    store = new Store({
      type: 'sqlite3',
      file: database
    })

    store.Model('user', function(){})
    store.Model('post', function(){})
  })

  after(function(){
    afterSQLite(database)
  })


  it('cache contains all models', function(){
    return store.ready(function(){
      store.cache.should.have.keys('user', 'post')
    })
  })

  it('cache contains model attributes', function(){
    return store.ready(function(){
      store.cache.user.should.have.keys('attributes')
      store.cache.post.should.have.keys('attributes')
      store.cache.user.attributes.should.have.size(3)
      store.cache.post.attributes.should.have.size(4)
    })
  })

  it('cache contains only necessary attribute information', function(){
    return store.ready(function(){
      store.cache.user.attributes.should.be.eql(cache.user.attributes.map(withoutChanged))
      store.cache.post.attributes.should.be.eql(cache.post.attributes.map(withoutChanged))
    })
  })


  describe('Load from cache file', function(){
    var store2
    before(function(){
      store2 = new Store({
        type: 'sqlite3',
        file: database,
        cache: cache
      })
      store2.Model('user', function(){})
      store2.Model('post', function(){})

      store2.setMaxListeners(0)
      store2.on('exception', function(){})
    })


    it('model attributes are defined', function(){
      return store2.ready(function(){
        store2.Model('user').definition.attributes.should.have.keys('id', 'login_changed', 'email')
        store2.Model('post').definition.attributes.should.have.keys('id_changed', 'user_id', 'thread_id', 'message')
      })
    })
  })


  describe('Diable autoload', function(){
    var store2

    before(function(){
      store2 = new Store({
        type: 'sqlite3',
        file: database,
        autoAttributes: false
      })
      store2.Model('user', function(){})
      store2.Model('post', function(){})

      store2.setMaxListeners(0)
      store2.on('exception', function(){})
    })


    it('model attributes are not defined', function(){
      return store2.ready(function(){
        store2.Model('user').definition.attributes.should.not.have.keys('id', 'login_changed', 'email')
        store2.Model('post').definition.attributes.should.not.have.keys('id_changed', 'user_id', 'thread_id', 'message')
      })
    })
  })
})
