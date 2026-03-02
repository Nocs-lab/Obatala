import React, { createContext, useState, useContext } from 'react';

// Criando o contexto
const DrawerContext = createContext(null);

// Provider que vai fornecer o contexto para os componentes
export const DrawerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null); // Estado para armazenar o conteúdo dinâmico do Drawer

  const toggleDrawer = (content = null) => {
    setIsOpen(!isOpen);
    setContent(content); // Define o conteúdo a ser exibido no Drawer
  };

  return (
    <DrawerContext.Provider value={{ isOpen, toggleDrawer, content }}>
      {children}
    </DrawerContext.Provider>
  );
};

// Hook para consumir o contexto
export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};
