---
id: install-iomesh
title: Install IOMesh
sidebar_label: Install IOMesh
---

## Quick Installation Guide

Choose the right script to execute according to your OS distribution:

> **_NOTE_: Helm3 would be installed automatically if it is not founded.**

<!--DOCUSAURUS_CODE_TABS-->

<!--RHEL7/CentOS7-->

```shell
# Every node running IOMesh must have an IP address belongs to IOMESH_DATA_CIDR
export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh_el7.sh | sh -
```

<!--RHEL8/CentOS8/CoreOS-->

```shell
# Every node running IOMesh must have an IP address belongs to IOMESH_DATA_CIDR
export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh_el8.sh | sh -
```
<!--END_DOCUSAURUS_CODE_TABS-->

Then wait until all IOMesh Cluster pods are ready:

```shell
watch kubectl get --namespace iomesh-system pods
```

Now IOMesh has been installed successfully!

> **_NOTE_: If any error occurs during the installation process, the IOMesh resources which installed by the script will be reserved for troubleshooting. You can use the uninstall script to clean up all IOMesh resources installed in the k8s cluster:
 `curl -sSL https://iomesh.run/uninstall_iomesh.sh | sh -`**

## Customized Installation Guide

This is the installtion guide for customized configurations.

### Install CSI Snapshotter

The [CSI snapshotter](https://github.com/kubernetes-csi/external-snapshotter) is part of Kubernetes implementation of Container Storage Interface (CSI).
Instasll CSI snapshotter to enable Volume Snapshot feature.

> **_NOTE_: CSI Snapshotter should be installed once per cluster**

1. Download and extract CSI external-snapshotter:

    ```shell
    curl -LO https://github.com/kubernetes-csi/external-snapshotter/archive/release-2.1.tar.gz
    tar -xf release-2.1.tar.gz && cd external-snapshotter-release-2.1
    ```

2. Install Snapshot CRDs:

    ```shell
    kubectl create -f ./config/crd
    ```

3. Edit `deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml` by adding a namespace, e.g., `kube-system`:

    ```shell
    sed -i "s/namespace: default/namespace: kube-system/g" deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml
    ```

4. Install snapshot controller, e.g., `kube-system`:

    ```shell
    kubectl apply -n kube-system -f ./deploy/kubernetes/snapshot-controller
    ```

5. Wait until snapshot controller is ready:

    ```shell
    kubectl get sts snapshot-controller -n kube-system
    ```

    ```output
    NAME                  READY   AGE
    snapshot-controller   1/1     32s
    ```

### Install Helm3

> **_NOTE_: skip this step if Helm3 is already installed.**

```shell
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

For more details, please refer to **[Install Helm](https://helm.sh/docs/intro/install/)**.

### Setup Helm Repo

```shell
helm repo add iomesh http://iomesh.com/charts
```

### Install IOMesh Operator

1. Download `iomesh-operator.yaml` with default configurations:

    ```shell
    helm show values iomesh/operator > iomesh-operator.yaml
    ```

2. Customize the `iomesh-operator.yaml`

3. Install IOMesh Operator:

    > **_NOTE_: replace `iomesh-operator` with your release name.**

    ```shell
    helm install iomesh-operator iomesh/operator \
                --create-namespace \
                --namespace iomesh-system \
                --values iomesh-operator.yaml \
                --wait 
    ```

    ```output
    NAME: iomesh-operator
    LAST DEPLOYED: Wed Jun 30 15:06:12 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

4. You can run `kubectl --namespace iomesh-system get pods` to check out the results:
    
    ```bash
    kubectl --namespace iomesh-system get pods
    ```

    ```output
    NAME                                                     READY   STATUS    RESTARTS   AGE
    iomesh-operator-hostpath-provisioner-pnjhg               1/1     Running   0          2m21s
    iomesh-operator-hostpath-provisioner-vfpmb               1/1     Running   0          2m21s
    iomesh-operator-hostpath-provisioner-z5njn               1/1     Running   0          2m21s
    iomesh-operator-zookeeper-operator-6cc8564d7c-j26wl      1/1     Running   0          2m21s
    ndm-cluster-exporter-8675b6f567-thxj5                    1/1     Running   0          2m21s
    ndm-node-exporter-8lgrn                                  1/1     Running   0          2m22s
    ndm-node-exporter-g96s7                                  1/1     Running   0          2m22s
    ndm-node-exporter-xfgdg                                  1/1     Running   0          2m22s
    node-disk-manager-9c622                                  1/1     Running   0          2m22s
    node-disk-manager-vgqwm                                  1/1     Running   0          2m22s
    node-disk-manager-vm7nw                                  1/1     Running   0          2m22s
    node-disk-operator-7c84b8bd6c-mjqq4                      1/1     Running   0          2m21s
    operator-6b87858cbd-8qdp6                                1/1     Running   0          2m21s
    operator-6b87858cbd-lmftx                                1/1     Running   0          2m21s
    operator-6b87858cbd-sf72b                                1/1     Running   0          2m21s
    ```

### Install IOMesh Cluster

1. Download `iomesh-values.yaml` with default configurations:

    ```shell
    helm show values iomesh/iomesh > iomesh-values.yaml
    ```

2. Customize the `iomesh-values.yaml`

   **(required)** Fill in the `dataCIDR` according to your network:

    ```yaml
    chunk:
      dataCIDR: "10.234.1.0/24" # change to your own data network CIDR
    ```

   **(optional)** Configure the deployment mode for the cluster, and the default is hybrid-flash deployment. For all-flash deployment, you need to set `diskDeploymentMode` to `allFlash`.

    ```yaml
    diskDeploymentMode: "hybridFlash" # set `diskDeploymentMode` to `allFlash` in allFlash deployment mode
    ```

   **(optional)** If you only want iomesh to use a part of k8s node's disks, 
   configure the specific node's label in the `chunk.podPolicy.affinity`, for
   example:
   
   ```yaml
   chunk:
     podPolicy:
       affinity:
         nodeAffinity:
           requiredDuringSchedulingIgnoredDuringExecution:
             nodeSelectorTerms:
             - matchExpressions:
               - key: kubernetes.io/hostname # specific node label's key
                 operator: In
                 values:
                 - iomesh-worker-0 # specific node label's value
                 - iomesh-worker-1
    ```
    For more information about pod affinity configuration rule, see: [pod affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity) 

3. Install IOMesh Cluster:

    > **_NOTE_: replace `iomesh` with your release name.**

    ```shell
    helm install iomesh iomesh/iomesh \
        --create-namespace \
        --namespace iomesh-system \
        --values iomesh-values.yaml \
        --wait
    ```

    ```output
    NAME: iomesh
    LAST DEPLOYED: Wed Jun 30 16:00:32 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

4. You can run `kubectl --namespace iomesh-system get pods` to check out the result:

    ```bash
    kubectl --namespace iomesh-system get pods
    ```

    ```output
    NAME                                                     READY   STATUS    RESTARTS   AGE
    iomesh-iscsi-redirector-6xlq5                            1/2     Running   2          29s
    iomesh-iscsi-redirector-pm75v                            1/2     Running   2          29s
    iomesh-iscsi-redirector-qmcfv                            1/2     Running   2          29s
    iomesh-chunk-0                                           3/3     Running   0          28s
    iomesh-chunk-1                                           3/3     Running   0          21s
    iomesh-chunk-2                                           3/3     Running   0          17s
    iomesh-meta-0                                            2/2     Running   0          29s
    iomesh-meta-1                                            2/2     Running   0          29s
    iomesh-meta-2                                            2/2     Running   0          29s
    iomesh-operator-hostpath-provisioner-pnjhg               1/1     Running   0          10m
    iomesh-operator-hostpath-provisioner-vfpmb               1/1     Running   0          10m
    iomesh-operator-hostpath-provisioner-z5njn               1/1     Running   0          10m
    iomesh-operator-zookeeper-operator-6cc8564d7c-j26wl      1/1     Running   0          10m
    iomesh-zookeeper-0                                       1/1     Running   0          90s
    iomesh-zookeeper-1                                       1/1     Running   0          77s
    iomesh-zookeeper-2                                       1/1     Running   0          53s
    ndm-cluster-exporter-8675b6f567-thxj5                    1/1     Running   0          10m
    ndm-node-exporter-8lgrn                                  1/1     Running   0          10m
    ndm-node-exporter-g96s7                                  1/1     Running   0          10m
    ndm-node-exporter-xfgdg                                  1/1     Running   0          10m
    node-disk-manager-9c622                                  1/1     Running   0          10m
    node-disk-manager-vgqwm                                  1/1     Running   0          10m
    node-disk-manager-vm7nw                                  1/1     Running   0          10m
    node-disk-operator-7c84b8bd6c-mjqq4                      1/1     Running   0          10m
    operator-6b87858cbd-8qdp6                                1/1     Running   0          10m
    operator-6b87858cbd-lmftx                                1/1     Running   0          10m
    operator-6b87858cbd-sf72b                                1/1     Running   0          10m
    ```

### Install IOMesh CSI driver

1. Download `iomesh-csi-driver.yaml` with default configurations:

    ```shell
    helm show values iomesh/csi-driver > iomesh-csi-driver.yaml
    ```

2. Edit `iomesh-csi-driver.yaml`

    > **__NOTE__: For Kubernetes worker node OS is `CentOS8` or `CoreOS`, set `mountIscsiLock` to `true`. Otherwise, set it to `false`.**

    ```yaml
    driver:
      node:
        driver:
          mountIscsiLock: true
    ```

3. Install IOMesh CSI driver

    > **_NOTE_: replace `iomesh-csi-driver` with your release name.**

    ```shell
    helm install iomesh-csi-driver iomesh/csi-driver \
        --create-namespace \
        --namespace iomesh-system \
        --values iomesh-csi-driver.yaml \
        --wait
    ```

    ```output
    NAME: iomesh-csi-driver
    LAST DEPLOYED: Wed Jun 30 16:04:13 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

4. You can run `kubectl --namespace iomesh-system get pods` to check out the results:

    ```bash
    kubectl --namespace iomesh-system get pods
    ```

    ```output
    iomesh-iscsi-redirector-6xlq5                             2/2     Running   2          3m55s
    iomesh-iscsi-redirector-pm75v                             2/2     Running   2          3m55s
    iomesh-iscsi-redirector-qmcfv                             2/2     Running   2          3m55s
    iomesh-chunk-0                                            3/3     Running   0          3m54s
    iomesh-chunk-1                                            3/3     Running   0          3m47s
    iomesh-chunk-2                                            3/3     Running   0          3m43s
    iomesh-csi-driver-controller-plugin-7c67879774-6v4z8      6/6     Running   0          73s
    iomesh-csi-driver-controller-plugin-7c67879774-cjnw6      6/6     Running   0          73s
    iomesh-csi-driver-controller-plugin-7c67879774-z6wkl      6/6     Running   0          73s
    iomesh-csi-driver-node-plugin-2cr8r                       3/3     Running   0          73s
    iomesh-csi-driver-node-plugin-qcwxf                       3/3     Running   0          73s
    iomesh-csi-driver-node-plugin-tnbpf                       3/3     Running   0          73s
    iomesh-meta-0                                             2/2     Running   0          3m55s
    iomesh-meta-1                                             2/2     Running   0          3m55s
    iomesh-meta-2                                             2/2     Running   0          3m55s
    iomesh-operator-hostpath-provisioner-pnjhg                1/1     Running   0          12m
    iomesh-operator-hostpath-provisioner-vfpmb                1/1     Running   0          12m
    iomesh-operator-hostpath-provisioner-z5njn                1/1     Running   0          12m
    iomesh-operator-zookeeper-operator-6cc8564d7c-j26wl       1/1     Running   0          12m
    iomesh-zookeeper-0                                        1/1     Running   0          4m56s
    iomesh-zookeeper-1                                        1/1     Running   0          4m43s
    iomesh-zookeeper-2                                        1/1     Running   0          4m19s
    ndm-cluster-exporter-8675b6f567-thxj5                     1/1     Running   0          12m
    ndm-node-exporter-8lgrn                                   1/1     Running   0          12m
    ndm-node-exporter-g96s7                                   1/1     Running   0          12m
    ndm-node-exporter-xfgdg                                   1/1     Running   0          12m
    node-disk-manager-9c622                                   1/1     Running   0          12m
    node-disk-manager-vgqwm                                   1/1     Running   0          12m
    node-disk-manager-vm7nw                                   1/1     Running   0          12m
    node-disk-operator-7c84b8bd6c-mjqq4                       1/1     Running   0          12m
    operator-6b87858cbd-8qdp6                                 1/1     Running   0          12m
    operator-6b87858cbd-lmftx                                 1/1     Running   0          12m
    operator-6b87858cbd-sf72b                                 1/1     Running   0          12m
    ```

IOMeshCluster is now installed successfully, please go to [Setup IOMesh](setup-iomesh.md).

[1]: http://iomesh.com/charts
[2]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#setup-data-network

## Install IOMesh on OpenShift Container Platform

For OpenShift cluster, you can also install and use IOMesh through the IOMesh Operator on the OperatorHub page of the Red Hat OpenShift Container Platform.

### Pre-Install

Run IOMesh Operator pre-installation script in an environment where oc or kubectl can be used to access the OpenShift cluster, the script will install the dependencies of IOMesh Operator and specific IOMesh settings for the OpenShift cluster:

```shell
curl -sSL https://iomesh.run/iomesh-operator-pre-install-openshift.sh | sh -
```

### Install IOMesh Operator

1. Log in to your OpenShift Container Platform and visit the OperatorHub page. Select IOMesh Operator and click Install to start the installation of IOMesh Operator.

2. On the Installed Operators > IOMesh Operator > Create instance > YAML view, fill in an IOMesh Custom Resources according to IOMesh [YAML](https://iomesh.run/iomesh.yaml), change the spec.*.dataCIDR to your own data network CIDR.

### Install CSI Driver

Run IOMesh Operator post-installation script in an environment where oc or kubectl can be used to access the OpenShift cluster, the script will install IOMesh CSI Driver:

```shell
curl -sSL https://iomesh.run/iomesh-operator-post-install-openshift.sh | sh -
```
    
IOMeshCluster is now installed successfully, please go to [Setup IOMesh](setup-iomesh.md).
