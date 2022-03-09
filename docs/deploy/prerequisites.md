---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

## Installation Requirements
#### 集群节点数量
A Kubernetes (from v1.17 to v1.21) cluster with at least 3 worker nodes

#### 磁盘需求
##### 缓存盘
* 全闪模式: 无需配置
* 混闪模式: 每个 worker 节点至少有一块空闲的 SSD 磁盘，SSD 磁盘容量大于 60 GB

##### 数据盘
* 全闪模式: 每个 worker 节点至少有一块空闲的 SSD 磁盘，SSD 磁盘容量大于 60 GB
* 混闪模式: 每个 worker 节点至少有一块空闲的 HDD 磁盘，HDD 磁盘容量大于 60 GB

#### 网络需求
10GbE NIC or above for IOMesh storage network

#### 系统预留空间
每个 worker 节点的 /opt 目录预留至少 100GB 空间用于存储 IOMesh 集群元数据

## Setup Worker Node

For each Kubernetes worker node that will run IOMesh, follow the following steps:

### Setup Open-ISCSI

1. Install open-iscsi:

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

2. Edit `/etc/iscsi/iscsid.conf` by setting `node.startup` to `manual`:

    ```shell
    sudo sed -i 's/^node.startup = automatic$/node.startup = manual/' /etc/iscsi/iscsid.conf
    ```
    > **_NOTE_: The default value of the MaxRecvDataSegmentLength in /etc/iscsi/iscsi.conf is 32,768, which limits the maximum number of PVs(about 80,000) in IOMesh. If you want to create more than 80,000 PVs in IOMesh, it is recommended to set the value of MaxRecvDataSegmentLength to 163,840 or higher.**

3. Disable SELinux:

    ```shell
    sudo setenforce 0
    sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
    ```

4. Ensure `iscsi_tcp` kernel module is loaded:

    ```shell
    sudo modprobe iscsi_tcp
    sudo bash -c 'echo iscsi_tcp > /etc/modprobe.d/iscsi-tcp.conf'
    ```

5. Start `iscsid` service:

    ```shell
    sudo systemctl enable --now iscsid
    ```

### Setup Local Metadata Store

IOMesh uses local path `/opt/iomesh` to store metadata. Ensure that there is at least 100 GB free space at `/opt`.

### Setup Data Network

To avoid contention on network bandwith, it is necessary to setup a seperate network segment for IOMesh cluster. The `dataCIDR` defines the IP block for IOMesh data network. Every node running IOMesh should have an interface with IP address belonging to the `dataCIDR`.
