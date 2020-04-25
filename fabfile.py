import random
from fabric.contrib.files import append, exists
from fabric.api import cd, env, local, run, settings
import re

REPO_URL = 'https://github.com/tanmayawasekar/passport-practice.git'  

def deploy():
    site_folder = f'/home/ubuntu/sites/'  
    run(f'mkdir -p {site_folder}')  
    with cd(site_folder):  
        _install_docker()
        _install_docker_compose()
        _get_latest_source()
        _remove_existing_images_containers()
        _docker_compose_up()
        _build_docker_image()

def _docker_compose_up():
    run("docker-compose up -d")

def _install_docker_compose():
    with settings(warn_only=True):
        output = run("docker-compose --version")
        if output.failed:
            run("sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose")
            run('sudo chmod +x /usr/local/bin/docker-compose')
            run('docker-compose --version')


def _remove_existing_images_containers():
    output = run("docker ps -q")
    if output.stdout:
        run("docker kill "+" ".join(output.stdout.split("\r\n")))
    output = run("docker ps -a -q")
    if(output.stdout):
        run("docker rm " + " ".join(output.stdout.split("\r\n")))
    output = run("docker images -q")
    if(output.stdout):
        run("docker rmi "+" ".join(output.stdout.split("\r\n")))

def _build_docker_image():
    run("docker build -t tanmayawasekar/kitchen-display-ordering .")
    run("docker run -p 80:3000 -d tanmayawasekar/kitchen-display-ordering")


def _get_latest_source():
    if exists('.git'):  
        run('git pull origin master')  
    else:
        run(f'git clone {REPO_URL} .')  
    
def _install_docker():
    with settings(warn_only=True):
        output = run("docker --version")
        if output.failed:
            # run('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -')
            # run('sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"')
            # run('sudo apt-get update')
            # run('sudo apt-get install -y docker-ce')
            run('echo dependecies-->')
            run('sudo apt-get install \
              apt-transport-https \
              ca-certificates \
              curl \
              gnupg-agent \
              software-properties-common -y')
            run('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -')
            run('sudo apt-key fingerprint 0EBFCD88')
            run('sudo add-apt-repository \
                "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
                $(lsb_release -cs) \
                stable"')
            run('echo installing docker and all-->')
            run('sudo apt-get install docker-ce docker-ce-cli containerd.io')


def is_package_installed(pkgname):
    output = local('dpkg -s {}'.format(pkgname), capture=True)
    match = re.search(r'Status: (\w+.)*', output)
    if match and 'installed' in match.group(0).lower():
        return True
    return False
