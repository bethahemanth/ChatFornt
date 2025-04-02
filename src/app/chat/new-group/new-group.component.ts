// import { Component, OnInit } from '@angular/core';
// import { APIServiceService } from '../../Services/apiservice.service';
// import { UserDetails } from '../../Models/UserDetails';
// import { Group } from '../../Models/Group';

// @Component({
//   selector: 'app-new-group',
//   standalone: false,
//   templateUrl: './new-group.component.html',
//   styleUrl: './new-group.component.css'
// })
// export class NewGroupComponent implements OnInit {
//   activeTab: string = 'create'; // Default tab
//   currentUserId!: number;
//   newGroupName: string = '';
//   ownedGroups: Group[] = [];
//   selectedGroupId!: number;
//   groupMembers: UserDetails[] = [];
//   allUsers: UserDetails[] = [];
//   selectedNewMemberId!: number;

//   constructor(private api: APIServiceService) {}

//   ngOnInit(): void {
//     const userString = localStorage.getItem('user');
//     const user: UserDetails = userString ? JSON.parse(userString) : null;
//     if (user) {
//       this.currentUserId = user.user_id;
//       this.loadOwnedGroups();
//       this.loadAllUsers();
//     }
//   }

//   setActiveTab(tab: string): void {
//     this.activeTab = tab;
//     if (tab === 'manage') {
//       this.loadOwnedGroups();
//     }
//   }

//   createGroup(): void {
//     let initialOwnedGroups: Group[] = [];

//     // Step 1: Fetch the initial list of groups owned by the user
//     this.api.GetGroupsOfOwner(this.currentUserId).subscribe(
//       (groups: Group[]) => {
//         initialOwnedGroups = groups;

//         // Step 2: Create the new group
//         const group = {
//           group_name: this.newGroupName,
//           owner_id: this.currentUserId,
//           created_at: new Date()
//         };

//         this.api.CreateGroup(group).subscribe(
//           () => {
//             this.api.CustomAlert('Group created successfully!');
//             this.newGroupName = '';

//             // Step 3: Fetch the updated list of groups owned by the user
//             this.api.GetGroupsOfOwner(this.currentUserId).subscribe(
//               (updatedGroups: Group[]) => {
//                 this.ownedGroups = updatedGroups;

//                 // Step 4: Identify the newly created group
//                 const newGroup = updatedGroups.find(
//                   (group) => !initialOwnedGroups.some((g) => g.group_id === group.group_id)
//                 );

//                 if (newGroup) {
//                   // Step 5: Add the current user as a member of the newly created group
//                   this.api.AddUserToGroup(newGroup.group_id, this.currentUserId).subscribe(
//                     () => {
//                       this.api.CustomAlert('You have been added as a member of the group!');
//                     },
//                     (error) => {
//                       console.error('Error adding user to the group:', error);
//                     }
//                   );
//                 }
//               },
//               (error) => {
//                 console.error('Error fetching updated groups:', error);
//               }
//             );
//           },
//           (error) => {
//             console.error('Error creating group:', error);
//           }
//         );
//       },
//       (error) => {
//         console.error('Error fetching initial groups:', error);
//       }
//     );
//   }

//   loadOwnedGroups(): void {
//     this.api.GetGroupsOfOwner(this.currentUserId).subscribe(
//       (groups: Group[]) => {
//         this.ownedGroups = groups;
//       },
//       (error) => {
//         console.error('Error fetching owned groups:', error);
//       }
//     );
//   }

//   loadGroupMembers(): void {
//     if (!this.selectedGroupId) return;

//     this.api.GetMembersOfGroup(this.selectedGroupId).subscribe(
//       (members: UserDetails[]) => {
//         this.groupMembers = members;
//       },
//       (error) => {
//         console.error('Error fetching group members:', error);
//       }
//     );
//   }

//   loadAllUsers(): void {
//     this.api.GetAllUsers().subscribe(
//       (users: UserDetails[]) => {
//         this.allUsers = users;
//       },
//       (error) => {
//         console.error('Error fetching all users:', error);
//       }
//     );
//   }

//   addMember(): void {
//     if (!this.selectedGroupId || !this.selectedNewMemberId) return;

//     this.api.AddUserToGroup(this.selectedGroupId, this.selectedNewMemberId).subscribe(
//       () => {
//         this.api.CustomAlert('Member added successfully!');
//         this.loadGroupMembers(); // Refresh the list of group members
//       },
//       (error) => {
//         console.error('Error adding member:', error);
//       }
//     );
//   }

//   removeMember(userId: number): void {
//     if (!this.selectedGroupId) return;

//     this.api.DeleteUserFromGroup(this.selectedGroupId, userId).subscribe(
//       () => {
//         this.api.CustomAlert('Member removed successfully!');
//         this.loadGroupMembers(); // Refresh the list of group members
//       },
//       (error) => {
//         console.error('Error removing member:', error);
//       }
//     );
//   }
// }

import { Component, OnInit } from '@angular/core';
import { APIServiceService } from '../../Services/apiservice.service';
import { UserDetails } from '../../Models/UserDetails';
import { Group } from '../../Models/Group';

@Component({
  selector: 'app-new-group',
  standalone: false,
  templateUrl: './new-group.component.html',
  styleUrls: ['./new-group.component.css']
})
export class NewGroupComponent implements OnInit {
  activeTab: string = 'create'; // Default tab
  currentUserId!: number;
  newGroupName: string = '';
  ownedGroups: Group[] = [];
  selectedGroupId!: number;
  groupMembers: UserDetails[] = [];
  allUsers: UserDetails[] = [];
  selectedNewMemberId!: number;

  constructor(private api: APIServiceService) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    const user: UserDetails = userString ? JSON.parse(userString) : null;
    if (user) {
      this.currentUserId = user.user_id;
      this.loadOwnedGroups();
      this.loadAllUsers();
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'manage') {
      this.loadOwnedGroups();
    }
  }

  createGroup(): void {
    let initialOwnedGroups: Group[] = [];

    // Step 1: Fetch the initial list of groups owned by the user
    this.api.GetGroupsOfOwner(this.currentUserId).subscribe(
      (groups: Group[]) => {
        initialOwnedGroups = groups;

        // Step 2: Create the new group
        const group = {
          group_name: this.newGroupName,
          owner_id: this.currentUserId,
          created_at: new Date()
        };

        this.api.CreateGroup(group).subscribe(
          () => {
            this.api.CustomAlert('Group created successfully!');
            this.newGroupName = '';  // Reset the new group name

            // Step 3: Fetch the updated list of groups owned by the user
            this.api.GetGroupsOfOwner(this.currentUserId).subscribe(
              (updatedGroups: Group[]) => {
                this.ownedGroups = updatedGroups;

                // Step 4: Identify the newly created group
                const newGroup = updatedGroups.find(
                  (group) => !initialOwnedGroups.some((g) => g.group_id === group.group_id)
                );

                if (newGroup) {
                  // Step 5: Add the current user as a member of the newly created group
                  this.api.AddUserToGroup(newGroup.group_id, this.currentUserId).subscribe(
                    () => {
                      this.api.CustomAlert('You have been added as a member of the group!');
                    },
                    (error) => {
                      console.error('Error adding user to the group:', error);
                    }
                  );
                }
              },
              (error) => {
                console.error('Error fetching updated groups:', error);
              }
            );
          },
          (error) => {
            console.error('Error creating group:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching initial groups:', error);
      }
    );
  }

  loadOwnedGroups(): void {
    this.api.GetGroupsOfOwner(this.currentUserId).subscribe(
      (groups: Group[]) => {
        this.ownedGroups = groups;
      },
      (error) => {
        console.error('Error fetching owned groups:', error);
      }
    );
  }

  loadGroupMembers(): void {
    if (!this.selectedGroupId) return;

    this.api.GetMembersOfGroup(this.selectedGroupId).subscribe(
      (members: UserDetails[]) => {
        this.groupMembers = members;
      },
      (error) => {
        console.error('Error fetching group members:', error);
      }
    );
  }

  loadAllUsers(): void {
    this.api.GetAllUsers().subscribe(
      (users: UserDetails[]) => {
        this.allUsers = users;
      },
      (error) => {
        console.error('Error fetching all users:', error);
      }
    );
  }

  addMember(): void {
    if (!this.selectedGroupId || !this.selectedNewMemberId) return;

    this.api.AddUserToGroup(this.selectedGroupId, this.selectedNewMemberId).subscribe(
      () => {
        this.api.CustomAlert('Member added successfully!');
        this.loadGroupMembers(); // Refresh the list of group members
      },
      (error) => {
        console.error('Error adding member:', error);
      }
    );
  }

  removeMember(userId: number): void {
    if (!this.selectedGroupId) return;

    this.api.DeleteUserFromGroup(this.selectedGroupId, userId).subscribe(
      () => {
        this.api.CustomAlert('Member removed successfully!');
        this.loadGroupMembers(); // Refresh the list of group members
      },
      (error) => {
        console.error('Error removing member:', error);
      }
    );
  }
}
