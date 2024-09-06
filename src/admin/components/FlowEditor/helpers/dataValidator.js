// dataValidator.js

/**
 * Função para validar os dados iniciais de nodes e edges.
 * @param {Object} data - Os dados a serem validados (nodes e edges).
 * @returns {Object} - Um objeto contendo 'isValid' e uma lista de 'errors', caso existam.
 */
const validateInitialData = (data) => {
    let isValid = true;
    const errors = [];
  
    // Validação dos nós (nodes)
    if (!Array.isArray(data.nodes)) {
      isValid = false;
      errors.push("Nodes should be an array.");
    } else {
      data.nodes.forEach((node, index) => {
        if (typeof node.id !== 'string') {
          isValid = false;
          errors.push(`Node at index ${index} is missing a valid 'id' (should be a string).`);
        }
        if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
          isValid = false;
          errors.push(`Node at index ${index} is missing a valid 'position' (should contain 'x' and 'y' as numbers).`);
        }
        if (!Array.isArray(node.fields)) {
          isValid = false;
          errors.push(`Node at index ${index} has invalid 'fields' (should be an array).`);
        } else {
          node.fields.forEach((field, fieldIndex) => {
            if (typeof field.id !== 'string') {
              isValid = false;
              errors.push(`Field at index ${fieldIndex} in node ${index} is missing a valid 'id' (should be a string).`);
            }
            if (typeof field.title !== 'string') {
              isValid = false;
              errors.push(`Field at index ${fieldIndex} in node ${index} is missing a valid 'title' (should be a string).`);
            }
            if (typeof field.type !== 'string') {
              isValid = false;
              errors.push(`Field at index ${fieldIndex} in node ${index} is missing a valid 'type' (should be a string).`);
            }
            if (typeof field.value !== 'string') {
              isValid = false;
              errors.push(`Field at index ${fieldIndex} in node ${index} is missing a valid 'value' (should be a string).`);
            }
          });
        }
      });
    }
  
    // Validação das conexões (edges)
    if (!Array.isArray(data.edges)) {
      isValid = false;
      errors.push("Edges should be an array.");
    } else {
      data.edges.forEach((edge, index) => {
        if (typeof edge.id !== 'string') {
          isValid = false;
          errors.push(`Edge at index ${index} is missing a valid 'id' (should be a string).`);
        }
        if (typeof edge.source !== 'string') {
          isValid = false;
          errors.push(`Edge at index ${index} is missing a valid 'source' (should be a string).`);
        }
        if (typeof edge.target !== 'string') {
          isValid = false;
          errors.push(`Edge at index ${index} is missing a valid 'target' (should be a string).`);
        }
        if (typeof edge.type !== 'string') {
          isValid = false;
          errors.push(`Edge at index ${index} is missing a valid 'type' (should be a string).`);
        }
      });
    }
  
    return { isValid, errors };
  };
  
  export default validateInitialData;
  