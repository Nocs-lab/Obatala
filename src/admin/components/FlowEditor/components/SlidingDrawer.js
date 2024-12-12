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
        >
          <Button
            style={{
              position: "absolute",
              top: ".5rem",
              right: ".5rem",
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
