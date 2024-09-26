import React from "react";
import { useDrawer } from "../context/DrawerContext";
import { Icon, close } from "@wordpress/icons";
import { Button } from "@wordpress/components";
const SlidingDrawer = () => {
  const { isOpen, toggleDrawer, content } = useDrawer();

  return (
    <>
      {isOpen && (
        <div
          className="wp-drawer"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: "33%",
            padding: "50px 20px",
            zIndex: 1100,
            backgroundColor: "#fff",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            overflowY: "auto",
          }}
        >
          <Button
            style={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
            icon={<Icon icon={close} size={24} onClick={toggleDrawer} />}
          ></Button>

          {/* Renderiza o conteúdo dinâmico */}
          <div>{content}</div>
        </div>
      )}
    </>
  );
};

export default SlidingDrawer;
