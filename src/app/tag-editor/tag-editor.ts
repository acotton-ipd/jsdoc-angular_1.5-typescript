/**
* @file tag-editor component
* @author IPDemons
* @description The tag-editor component holds all the business logic for this app.
*/

angular.module('app').component('tagEditor', {

	templateUrl: 'tag-editor/tag-editor.html',
	bindings: {
		groupID: '=groupId'
	},
	controller: function($scope, $firebaseObject, $firebaseArray) {
		this.editmode = true;
		let that = this;
		let rootRef = firebase.database().ref('groups');
		/**
		* tagsRef Firebase reference to Group's Tags
		* @type {string}
		*/
		let tagsRef = rootRef.child(that.groupID).child('tags');

		/**
		* Watch for change in groupID to switch branches in Firebase
		* @method $watch
		* @description AngularFire method, necessary for 2-way bindings
		* @param {string} groupID group ID sent from Home component
		*/
		$scope.$watch('$ctrl.groupID', function() {
			tagsRef = rootRef.child(that.groupID).child('tags');
			that.tags = $firebaseArray(tagsRef.orderByChild('order'));
		});

		/**
		* Save Tag to Firebase
		* @param {object} tag Tag object to be saved
		*/
		this.saveTag = function(tag) {
			/**
			* @method $save
			* @description AngularFire method saves object to Firebase Ref
			*/
			this.tags.$save(tag);
		};

		this.deleteTag = function(tag) {
			let delTag = tag;
			this.tags.$remove(delTag).then((function(data) {
				reorderTags.call(this, delTag.order);
			}).bind(this));

			// let tagID = tag.$id;
			// let tagObj = $firebaseObject(tagsRef.child(tagID));
			//
			// tagObj.$loaded().then(function() {
			//     reorderTagsObject(tagObj.$id);
			//     // tagObj.$remove();
			// });

		};


		function reorderTags(delTagOrder) {
			// create temporary object to hold updated data
			let updates = {};
			for (let i = 0, len = this.tags.length; i < len; i++) {
				if (i >= (delTagOrder - 1)) {
					// fill the temp object with updated data
					updates['/' + this.groupID + '/tags/' + this.tags[i].$id + '/order'] = i + 1;
				}
			}
			//a single call to the database updates all data at once
			return rootRef.update(updates);
		}

		this.addNewTag = function() {
			let newOrder = this.tags.length + 1;
			if (this.newTag != '') {
				this.tags.$add({
					name: this.newTag,
					order: newOrder
				});
			}
			this.newTag = '';
		};

	}
});