---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

## Installation Requirements

- A Kubernetes 1.17+ cluster with at least 3 worker nodes
- Each worker node needs
  - At least one idle SSD, for IOMesh journal and cache
  - At least one idle HDD, for IOMesh datastore
  - A 10GbE (or higher) NICs, for IOMesh data network connectivity
  - 100G disk space per worker for hostpath-provisioner

## Setup worker node

For each Kubernetes worker node that you want to run IOMesh, do the following setups:

### Setup Open-ISCSI

1. Install open-iscsi

For RHEL/CentOS:

```shell
sudo yum install iscsi-initiator-utils -y
```

For Ubuntu:

```shell
sudo apt-get install open-iscsi -y
```

2. Set `node.startup` to `manual` in `/etc/iscsi/iscsid.conf`

```shell
sudo sed -i 's/^node.startup = automatic$/node.startup = manual/' /etc/iscsi/iscsid.conf
```

3. Disable SELinux

```shell
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

4. Enable and start `iscsid` service

```shell
sudo systemctl enable --now iscsid
```

### Setup local metadata store

IOMesh uses local path `/opt/iomesh` to store metadata. User must ensure that there is at least 100G free space at `/opt`.

### Setup data network

To avoid contention on network bandwith, it would be better to setup a seperate network segment for IOMesh cluster. The `dataCIDR` defines the IP block for the IOMesh data network. Every node running IOMesh should have an interface whose IP address belongs to the `dataCIDR`.
