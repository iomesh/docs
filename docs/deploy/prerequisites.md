---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

## Installation Requirements
#### Kubernetes Cluster Requirements
A Kubernetes (from v1.17 to v1.21) cluster with at least 3 worker nodes.

#### Disk Requirements
##### Cache Disk
* All-flash mode: no configuration is required.
* Hybrid-flash mode: there should be at least one available SSD on each worker node, and the SSD capacity should be larger than 60 GB.

##### Data Disk
* All-flash mode: there should be at least one available SSD on each worker node, and the SSD capacity should be larger than 60 GB.
* Hybrid-flash mode: there should be at least one available HDD on each worker node, and the HDD capacity should be larger than 60 GB.

#### Network Requirements
Network cards of 10GbE or above are required for the IOMesh storage network.

#### Reserved System Space
At least 100GB of disk space is required in the /opt directory on each worker node for storing the IOMesh cluster metadata.

## Worker Node Setup
Follow the steps below to set up each Kubernetes worker node that runs IOMesh.

### Set Up Open-iSCSI

1. Install open-iscsi.

  <!--DOCUSAURUS_CODE_TABS-->
    <!--RHEL/CentOS-->
    ```shell
    sudo yum install iscsi-initiator-utils -y
    ```
    <!--Ubuntu-->
    ```shell
    sudo apt-get install open-iscsi -y
    ```

  <!--END_DOCUSAURUS_CODE_TABS-->

2. Edit `/etc/iscsi/iscsid.conf` by setting `node.startup` to `manual`.

    ```shell
    sudo sed -i 's/^node.startup = automatic$/node.startup = manual/' /etc/iscsi/iscsid.conf
    ```
    > **_NOTE_: The default value of the MaxRecvDataSegmentLength in /etc/iscsi/iscsi.conf is set at 32,768, and the maximum number of PVs is limited to 80,000 in IOMesh. To create PVs more than 80,000 in IOMesh, it is recommended to set the value of MaxRecvDataSegmentLength to 163,840 or above.**
    
3. Disable SELinux.

    ```shell
    sudo setenforce 0
    sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
    ```

4. Ensure `iscsi_tcp` kernel module is loaded.

    ```shell
    sudo modprobe iscsi_tcp
    sudo bash -c 'echo iscsi_tcp > /etc/modprobe.d/iscsi-tcp.conf'
    ```

5. Start `iscsid` service.

    ```shell
    sudo systemctl enable --now iscsid
    ```
### Set Up Local Metadata Store

IOMesh stores metadata in the local path `/opt/iomesh`. Ensure that there is at least 100Gb of available space at `/opt`. 

### Set Up Data Network

To avoid contention on network bandwidth, set up a separate network for the IOMesh Cluster. The `dataCIDR` defines IP block for the IOMesh data network. Every node running IOMesh should have an interface with an IP address belonging to `dataCIDR`.

