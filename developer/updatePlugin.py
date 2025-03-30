from playwright.sync_api import sync_playwright
from dotenv import load_dotenv
import os
import sys

load_dotenv()

site_login_curadoria = os.getenv("site_login_curadoria")
page_plugin = os.getenv("page_plugin")
page_upload = os.getenv("page_upload")
userCuradoria = os.getenv("userCuradoria")
pwd = os.getenv("pwd")

def loginCuradoria(page):
    try:
        page.goto(site_login_curadoria)
        page.fill("input[name='log']", userCuradoria)
        page.fill("input[name='pwd']", pwd)
        page.click('xpath=//*[@id="wp-submit"]')
        if page.wait_for_selector('text=Welcome to WordPress!', timeout=5000):
            print("Login realizado com sucesso")
    except Exception as e:
        print(f"Erro ao realizar login: {e}")
        sys.exit(1) # Interrompe o script em caso de erro

new_plugin_executado = False  # Váriável de controle

def deactivePlugin(page):
    global new_plugin_executado
    try:
        page.goto(page_plugin)
        page.click('[data-slug="obatala-plugin-de-gestao-de-processos-curatoriais-para-wordpress"] .row-actions.visible >> text=Deactivate')
        if page.wait_for_selector('text=Plugin deactivated.', timeout=5000):
            print("Desativação do plugin antigo: Sucesso")
    except Exception as e:
        print("Nenhum plugin ativo encontrado, adicionando nova versão...")
        if not new_plugin_executado:
            newPlugin(page)
            new_plugin_executado = True  # Marca como executado

def pathPlugin():
    plugin_path = "./developer/obatala.zip"
    if os.path.exists(plugin_path):
        print("Plugin encontrado.")
    else:
        print("Plugin não encontrado.")
        sys.exit(1) 

def newPlugin(page):
    try:
        page.goto(page_upload)
        page.click('xpath=//*[@id="wpbody-content"]/div[3]/a/span[1]')
        with page.expect_file_chooser() as fc:
            page.click('xpath=//*[@id="pluginzip"]', timeout=5000)
            file_chooser = fc.value
            file_chooser.set_files("./developer/obatala.zip") # Path do plugin utilizado
        page.click('xpath=//*[@id="install-plugin-submit"]')
        page.wait_for_load_state("networkidle")
        if page.is_visible('text=This plugin is already installed.'):
            print("Tela de plugin existente detectada")
            page.click('xpath=//*[@id="wpbody-content"]/div[2]/p[6]/a[1]')
        else:
            page.click('xpath=/html/body/div[1]/div[2]/div[2]/div[1]/div[2]/p[4]/a[1]')
        page.wait_for_load_state("networkidle")
        if page.is_visible('text=Plugin activated.') or page.is_visible('text=Plugin updated successfully.'):
            print("Adição do novo plugin: Sucesso")
    except Exception as e:
        print(f"Erro ao adicionar/ativar novo plugin: {e}")
        sys.exit(1) 


with sync_playwright() as p:
    navegador = p.chromium.launch()
    page = navegador.new_page()
    pathPlugin()
    loginCuradoria(page)
    deactivePlugin(page)
    if not new_plugin_executado:
        newPlugin(page)  # Só será chamado se não tiver sido executada.

    


  