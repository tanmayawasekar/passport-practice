    # 1- Install AWS CLI
    curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
    unzip awscli-bundle.zip
    ./awscli-bundle/install -b ~/bin/aws
    
    # 2- Get the public IP of the current CircleCI runner
    PUBLIC_IP=$(curl ipinfo.io/ip)
    
    # 3- Get AWS Region
    # TODO Don't forget to replcae with your own Region
    AWS_REGION=us-east-2
    
    # 4- Get SG ID
    # TODO Don't forget to replace with your own SG ID
    SG_ID=sg-XXXXXXXX
    
    # 5- Add an ingress rule to the security group
    ~/bin/aws ec2 authorize-security-group-ingress --region $AWS_REGION --group-id $SG_ID \
      --protocol tcp --port 22 --cidr $PUBLIC_IP/24
    
    # 6- Give the ingress rule some time to propogate
    sleep 5
    
    # 7- SSH to the server to deploy

    # TODO Change to your username
    EC2_USERNAME=ubuntu

    # TODO Change to your server's URL or public IP# Remember that this matches the hostname you entered#  in the Project Settings on Circle
    EC2_PUBLIC_DNS=application-server.example.com

    ssh -o StrictHostKeyChecking=no $EC2_USERNAME@$EC2_PUBLIC_DNS \
        # other commands \
        # TODO Perform steps to deploy
        # . \
        # . \
        # .
    
    # 8- Remove the ingress rule
    ~/bin/aws ec2 revoke-security-group-ingress --region $AWS_REGION --group-id $SG_ID \
      --protocol tcp --port 22 --cidr $PUBLIC_IP/24