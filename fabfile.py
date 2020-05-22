import random
from fabric.contrib.files import append, exists
from fabric.api import cd, env, local, run, settings
import re
from fabric.context_managers import shell_env

BRANCH_NAME = "master"
REPO_URL = 'https://github.com/tanmayawasekar/passport-practice.git'  

def deploy(branch_name):
    site_folder = f'/home/ubuntu/sites/'  
    run(f'mkdir -p {site_folder}')  
    with cd(site_folder):  
        _install_docker()
        _install_docker_compose()
        _get_latest_source(branch_name)
        # _remove_existing_images_containers()
        _docker_compose_up()
        # _docker_mysql_install()
        # _build_docker_image()

def _docker_compose_up():
    run("sudo docker-compose down")
    run("mkdir -p ~/db-redis")
    run("mkdir -p ~/lib-redis")
    run("sudo chown -R 1001:1001 ~/db-redis")
    run("sudo chown -R 1001:1001 ~/lib-redis")
    import os
    import json
    SES_KEY = os.getenv('SES_KEY')
    SES_PASSWORD = os.environ.get('SES_PASSWORD')
    a = "export SES_KEY=%s"%SES_KEY
    b = "export SES_PASSWORD=%s"%SES_PASSWORD
    run(a)
    run(b)
    with settings(warn_only=True):
        ses_data = {
            "SES_KEY": "\"{}\"".format(SES_KEY),
            "SES_PASSWORD": "\"{}\"".format(SES_PASSWORD),
        }
        run("rm sesKeys.js")
        run("touch sesKeys.js")
        # run("echo 'const ses_creds = {SES_KEY:%s, SES_PASSWORD:%s};' > sesKeys.js" % ("\""+SES_KEY+"\"", "\""+SES_PASSWORD+"\""))
        run('echo "const ses_creds = %s" > sesKeys.js' % json.dumps(ses_data))
        # run('echo %s >> sesKeys.js' )
        run('echo ;\n >> sesKeys.js')
        run('echo "module.exports = {ses_creds: ses_creds};" >> sesKeys.js')
    run("SES_KEY=%s SES_PASSWORD=%s sudo docker-compose up --build -d" % (SES_KEY, SES_PASSWORD))
    # run("sudo docker system prune -y")
    # https://github.com/Ideonella-sakaiensis/lib_mysqludf_redis
    # run('sudo docker exec mysql sh -c "apt-get update -y"')
    # run('sudo docker exec mysql sh -c "apt-get install -y make wget gcc git"')
    # run('sudo docker exec mysql sh -c "apt-get install -y libmariadb-dev policycoreutils"')
    # run('sudo docker exec mysql sh -c "apt-get install libmysqlclient-dev -y"')
    # run('sudo docker exec mysql sh -c "git clone https://github.com/Ideonella-sakaiensis/lib_mysqludf_redis.git"')
    # run('sudo docker exec mysql sh -c "cd lib_mysqludf_redis/"')
    # run('sudo docker exec mysql sh -c "cd lib_mysqludf_redis/ && sed -i \'s/127.0.0.1/redis/g\' lib_mysqludf_redis.c"')
    # run('sudo docker exec mysql sh -c "cd lib_mysqludf_redis/ && make INCLUDE_PATH=`mysql_config --variable=pkgincludedir`"')
    # run('sudo docker exec mysql sh -c "cd lib_mysqludf_redis/ && make install"')
    # Run the below command after ssh into docker container mysql.
    # run('sudo docker exec mysql sh -c "make installdb")

def _install_docker_compose():
    with settings(warn_only=True):
        output = run("docker-compose --version")
        if output.failed:
            run("sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose")
            run('sudo chmod +x /usr/local/bin/docker-compose')
            run('docker-compose --version')


def _remove_existing_images_containers():
    output = run("sudo docker ps -q")
    if output.stdout:
        run("sudo docker kill "+" ".join(output.stdout.split("\r\n")))
    output = run("sudo docker ps -a -q")
    if(output.stdout):
        run("sudo docker rm " + " ".join(output.stdout.split("\r\n")))
    output = run("sudo docker images -q")
    if(output.stdout):
        run("sudo docker rmi "+" ".join(output.stdout.split("\r\n")))

def _build_docker_image():
    run("sudo docker build -t tanmayawasekar/practice-project-display-ordering .")
    run("sudo docker run -p 80:3000 -d tanmayawasekar/practice-project-display-ordering")


def _get_latest_source(branch_name):
    if exists('.git'):  
        run('git fetch origin {}'.format(branch_name or BRANCH_NAME))  
        run('git checkout {}'.format(branch_name or BRANCH_NAME))  
        run('git pull origin {}'.format(branch_name or BRANCH_NAME))  
    else:
        run(f'git clone {REPO_URL} .')  
    
def _install_docker():
    with settings(warn_only=True):
        output = run("sudo docker --version")
        # run("sudo service docker restart")
        # run("sudo usermod -aG docker user")

        if output.failed:
            run("sudo apt-get remove docker docker-engine")
            run("curl -sSL https://get.docker.com/ | sh")
            run("sudo usermod -aG docker user")
            # run('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -')
            # run('sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable"')
            # run('sudo apt-get update')
            # run('sudo apt-get install -y docker-ce')
            # run('echo dependecies-->')
            # run('sudo apt-get install \
            #   apt-transport-https \
            #   ca-certificates \
            #   curl \
            #   gnupg-agent \
            #   software-properties-common -y')
            # run('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -')
            # run('sudo apt-key fingerprint 0EBFCD88')
            # # run('sudo add-apt-repository \
            # #     "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
            # #     $(lsb_release -cs) \
            # #     stable"')
            # run('sudo add-apt-repository \
            #     "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable"')
            # run('sudo apt-get update -y')
            # run('echo installing docker and all-->')
            # run('sudo apt-get install docker-ce docker-ce-cli containerd.io')
            run('sudo docker --version')


def is_package_installed(pkgname):
    output = local('dpkg -s {}'.format(pkgname), capture=True)
    match = re.search(r'Status: (\w+.)*', output)
    if match and 'installed' in match.group(0).lower():
        return True
    return False
