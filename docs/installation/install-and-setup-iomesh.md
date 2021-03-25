---
id: install-and-setup-iomesh
title: Install and Setup IOMesh
sidebar_label: Install and Setup IOMesh
---

## Quick Installation Guide

Installation script varies for different OS distributions.

> **_NOTE_: Helm3 would be installed automatically if it is not founded.**

<!--DOCUSAURUS_CODE_TABS-->

<!--RHEL7/CentOS7-->

```shell
export IOMESH_DATA_CIDR=10.234.1.0/24 # Every node running IOMesh must have an IP address belongs to this CIDR
curl -sSL https://raw.githubusercontent.com/iomesh/docs/master/scripts/install_iomesh_el7.sh | sh -
```

<!--RHEL8/CentOS8/CoreOS-->

```shell
export IOMESH_DATA_CIDR=10.234.1.0/24 # Every node running IOMesh must have an IP address belongs to this CIDR
curl -sSL https://raw.githubusercontent.com/iomesh/docs/master/scripts/install_iomesh_el8.sh | sh -
```
<!--END_DOCUSAURUS_CODE_TABS-->

Then wait until all IOMesh Cluster pods ready.

```shell
watch kubectl get --namespace iomesh-system pods
```

## Customized Installation Guide

This is the sophisticated installtion guide for customized configurations.

### Deploy Snapshot Controller

Snapshot Controller manages the snapshot CRDs.
There must be **only one instance** of Snapshot Controller running and **only one set** of volume snapshot CRDs installed per cluster.

1. Download and extract **[Kubernetes CSI external-controller](https://github.com/kubernetes-csi/external-snapshotter/tree/release-2.1)**

```shell
curl -LO https://github.com/kubernetes-csi/external-snapshotter/archive/release-2.1.zip
unzip release-2.1.zip && cd external-snapshotter-release-2.1
```

2. Create Snapshot beta CRD

```shell
kubectl create -f ./config/crd
```

3. Modify `deploy/kubernetes/snapshot-controller/setup-snapshot-controller.yaml` by adding a namespace for StatefulSet, eg. `kube-system`.

   ```yaml
   kind: StatefulSet
   apiVersion: apps/v1
   metadata:
     name: snapshot-controller
     namespace: kube-system # <-- Add namespace here
   # ...
   ```

4. Modify `deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml` by adding a namespace for StatefulSet. eg. `kube-system`

   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: snapshot-controller
     namespace: kube-system # <-- Add namespace here
   # ...
   ```

5. Install Snapshot Controller

```shell
kubectl apply -f ./deploy/kubernetes/snapshot-controller
```

6. Verify snapshot-controller installation

```shell
kubectl get sts snapshot-controller -n kube-system
```

```output
NAME                  READY   AGE
snapshot-controller   1/1     32s
```

### Install Helm3

Skip this step if Helm3 is already installed.

```shell
$ curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
$ chmod 700 get_helm.sh
$ ./get_helm.sh
```

Please refer to **[Install Helm](https://helm.sh/docs/intro/install/)** for more details.


### Setup Helm repo

```shell
helm repo add iomesh http://iomesh.com/charts
```

### Install IOMesh Operator

1. Download `iomesh-operator.yaml` with default configurations.

```shell
helm show values iomesh/operator > iomesh-operator.yaml
```

2. Customize the `iomesh-operator.yaml`.

3. Install IOMesh Operator

> **_NOTE_: replace `my-iomesh-operator` with your release name.**
```shell
helm install my-iomesh-operator iomesh/operator \
	       	--namespace iomesh-system \
	       	--create-namespace \
	       	--wait
```

4. Wait until IOMesh Operator ready

```shell
watch kubectl get --namespace iomesh-system pods
```

### Install IOMesh Cluster

1. Download `iomesh-values.yaml` with default configurations.

```shell
helm show values iomesh/iomesh > iomesh-values.yaml
```

2. Customize the `iomesh-values.yaml`.

```yaml
chunk:
  dataCIDR: "10.234.1.0/24" # change to data network CIDR
```

3. Install IOMesh Cluster.

> **_NOTE_: replace `my-iomesh` with your release name.**

```shell
helm install my-iomesh iomesh/iomesh \
    --create-namespace \
    --namespace iomesh-system \
    --values iomesh-values.yaml \
    --wait
```

4. Wait until IOMesh Cluster pod ready.

```
watch kubectl get --namespace iomesh-system pods
```

### Install IOMesh CSI driver

1. Download `iomesh-csi-driver.yaml` with default configurations.

```shell
helm show values iomesh/csi-driver > iomesh-csi-driver.yaml
```

2. Customize `iomesh-csi-driver.yaml`

If Kubernetes worker node is installed with `CentOS8` or `CoreOS`, please set `mountIscsiLock` to `true`

```yaml
driver:
  node:
    driver:
      mountIscsiLock: true
```

3. Install IOMesh CSI driver

> **_NOTE_: replace `my-iomesh-csi-driver` with your release name.**

```shell
helm install my-iomesh-csi-driver iomesh/csi-driver \
    --create-namespace \
    --namespace iomesh-system \
    --values iomesh-csi-driver.yaml \
    --wait
```

4. Wait until IOMesh Cluster pod ready.

```
watch kubectl get --namespace iomesh-system pods
```

[1]: http://iomesh.com/charts
[2]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#setup-data-network
