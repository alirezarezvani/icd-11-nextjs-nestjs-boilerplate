/**
 * Mock API service for frontend-only template
 * Provides sample ICD-11 data for development and demo purposes
 */

export interface MockICD11Entity {
  id: string;
  title: string;
  definition?: string;
  parent?: string;
  children?: string[];
  code?: string;
}

// Sample ICD-11 data for healthcare providers
const mockEntities: MockICD11Entity[] = [
  {
    id: "455013390",
    title: "Diseases of the circulatory system",
    definition: "This chapter includes diseases of the circulatory system including cardiovascular diseases.",
    children: ["374021358", "1630407678", "1901046866"],
    code: "BA00-BE2Z"
  },
  {
    id: "374021358", 
    title: "Hypertensive diseases",
    definition: "Conditions characterized by persistently high arterial blood pressure.",
    parent: "455013390",
    children: ["1201177314", "1078992300"],
    code: "BA00-BA0Z"
  },
  {
    id: "1201177314",
    title: "Essential hypertension",
    definition: "High blood pressure without identifiable underlying cause.",
    parent: "374021358",
    code: "BA00"
  },
  {
    id: "334423054",
    title: "Diseases of the respiratory system", 
    definition: "This chapter includes diseases affecting the respiratory tract.",
    children: ["718687701", "1766440644"],
    code: "CA00-CB7Z"
  },
  {
    id: "718687701",
    title: "Acute upper respiratory infections",
    definition: "Infections primarily affecting nose, sinuses, pharynx, larynx, and trachea.",
    parent: "334423054",
    children: ["1766440644"],
    code: "CA00-CA0Z"
  }
];

/**
 * Mock search function that simulates ICD-11 API responses
 */
export function mockSearchICD11(
  query: string,
  options: {
    limit?: number;
    offset?: number;
    includeKeywords?: boolean;
  } = {}
): Promise<{ entities: MockICD11Entity[]; total: number }> {
  const { limit = 20, offset = 0, includeKeywords = true } = options;
  
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const filtered = mockEntities.filter(entity => {
        const searchFields = [
          entity.title,
          entity.definition,
          entity.code
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchFields.includes(query.toLowerCase());
      });
      
      const paginated = filtered.slice(offset, offset + limit);
      
      resolve({
        entities: paginated,
        total: filtered.length
      });
    }, 300); // Simulate network delay
  });
}

/**
 * Mock function to get entity details by ID
 */
export function mockGetEntityById(id: string): Promise<MockICD11Entity | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const entity = mockEntities.find(e => e.id === id);
      resolve(entity || null);
    }, 200);
  });
}

/**
 * Mock function to get entity children
 */
export function mockGetEntityChildren(parentId: string): Promise<MockICD11Entity[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const children = mockEntities.filter(entity => entity.parent === parentId);
      resolve(children);
    }, 200);
  });
}

/**
 * Mock hierarchical data for breadcrumbs and navigation
 */
export function mockGetEntityHierarchy(id: string): Promise<MockICD11Entity[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const hierarchy: MockICD11Entity[] = [];
      let currentEntity = mockEntities.find(e => e.id === id);
      
      // Build hierarchy from current entity to root
      while (currentEntity) {
        hierarchy.unshift(currentEntity);
        if (currentEntity.parent) {
          currentEntity = mockEntities.find(e => e.id === currentEntity!.parent);
        } else {
          break;
        }
      }
      
      resolve(hierarchy);
    }, 150);
  });
}