var should = require('should')
	, db = require('ninjazord')
	, Miranda = require('../lib/Miranda');

describe('Miranda Test', function(){
	before(function (done){
		db.nukeNamespace('tests.', function(){
			db.setPrefix('tests.');
			done();
		});
	});

	describe('set', function(){
		it('should set standard permissions', function(done){
			Miranda.set('1','testResource',{
				create : true,
				read : true,
				update : false,
				delete : true
			}, function(res){
				res.should.equal(true);
				done();
			});
		});
		it('should reject sets for anything other than * OR CRUD',function(){
			Miranda.set('2','testResource',{
				destroy : true
			}, function(res){
				res.should.not.equal(true);
				done();
			});
		});
		it('should be able to set wildcards for users', function(done){
			Miranda.set('*','testResource.1',{ '*' : true}, function(res){
				res.should.equal(true);
				done();
			});
		});
		it('should be able to set wildcards for resources', function(done){
			Miranda.set('admin','*',{ '*' : true }, function(res){
				res.should.equal(true);
				done();
			});
		});
		it('should accept an array of arguments',function(done){
			Miranda.set([
				['3','testResource', { create : true, read: true, update : true, delete: true}],
				['4','testResource', { create : true, read: true, update : true, delete: true}],
				['5','testResource', { create : true, read: true, update : true, delete: true}]
			],function(){
				done();
			});
		});
	});

	describe('get', function(){
		it('should return a list of permissions when no action is provided',function(done){
			Miranda.get('1','testResource',function(permissions){
				permissions.should.be.a('object');
				permissions.create.should.equal(true);
				permissions.update.should.equal(false);
				done();
			});
		});
		it('should let user 1 create testResource', function(done){
			Miranda.get('1','testResource', 'create', function(permission){
				permission.should.equal(true);
				done();
			});
		});
		it('should let anyRandomUser do anything to testResource.1', function(done){
			Miranda.get('anyRandomUser','testResource.1','delete',function(permission){
				permission.should.equal(true);
				done();
			});
		});
		it('should let the admin do... anything.', function(done){
			Miranda.get('admin','SUPERHIDDENRESOURCE','*', function(permission){
				permission.should.equal(true);
				done();
			});
		});
		it('should support getting an object of permissions objects', function (done){
			Miranda.get('1',{
				testResource : 'testResource',
				testResourceOne : 'testResource.1',
				hidden : 'SUPERHIDDENRESOURCE'
			}, function(permissions){
				permissions.should.be.a('object');
				permissions.testResource.should.be.a('object');
				permissions.testResourceOne.should.be.a('object');
				permissions.hidden.should.be.a('object');
				done();
			});
		});
	});
});