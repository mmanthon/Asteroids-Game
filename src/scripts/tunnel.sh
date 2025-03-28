while getopts h:k: flag
do
    case "${flag}" in
        h) hostname=${OPTARG};;
        k) publickey=${OPTARG};;
    esac
done

if [ -z "$publickey" ]
  then
    echo "usage: tunnel.sh -h [hostname] -k [publickey]"
    exit
fi
if [ -z "$hostname" ]
  then
    echo "usage: tunnel.sh -h [hostname] -k [publickey]"
    exit
fi

# localport:tunnelhost:remoteport remotehost
ssh -i $publickey -L 3306:localhost:3306 $hostname

