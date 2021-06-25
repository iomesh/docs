---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

## Installation Requirements

- A Kubernetes 1.17+ cluster with at least 3 worker nodes
- Each worker node needs
  - At least one free SSD for IOMesh journal and cache
  - At least one free HDD for IOMesh datastore
  - A 10GbE NIC or above for IOMesh storage network
  - At least 100GB free space on /opt

## Setup Worker Node

For each Kubernetes worker node that will run IOMesh, do the following steps:

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

3. Disable SELinux:

    ```shell
    sudo setenforce 0
    sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
    ```

4. Start `iscsid` service:

    ```shell
    sudo systemctl enable --now iscsid
    ```

### Setup Local Metadata Store

IOMesh uses local path `/opt/iomesh` to store metadata. Ensure that there is at least 100G free space at `/opt`.

### Setup Data Network

To avoid contention on network bandwith, it is necessary to setup a seperate network segment for IOMesh cluster. The `dataCIDR` defines the IP block for IOMesh data network. Every node running IOMesh should have an interface whose IP address belongs to the `dataCIDR`.
