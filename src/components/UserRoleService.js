// src/services/UserRoleService.js

class UserRoleService {
    static isMember(user) {
      return user?.role === "MEMBER";
    }
  
    static isAdmin(user) {
      return user?.role === "ADMIN";
    }
  
    static isMentor(user) {
      return user?.role === "MENTOR";
    }
  
    static getAccessibleMenuItems(user) {
      if (!user) return [];
      
      if (this.isMember(user)) {
        return [
          "dashboard",
          "charts",
          "nation-points", 
          "nation-performance-overview",
          "profile"
        ];
      }
      
      // Add other role conditions as needed
      return null; // Return null means show all
    }
  }
  
  export default UserRoleService;